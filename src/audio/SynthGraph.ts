import { PARAMETER_REGISTRY, type ParameterValues } from '../synth/parameters';
import type {
  LfoIndex,
  LfoTarget,
  NoiseColour,
  ParameterId,
} from '../synth/types';
import type {
  AnalyserNodePort,
  AudioBufferSourceNodePort,
  AudioContextPort,
  AudioNodePort,
  GainNodePort,
  OscillatorNodePort,
} from './contracts';
import { createNoiseBuffer, type RandomSource } from './graph/noise';
import { setAudioParam } from './scheduling/adsr';
import { Voice } from './Voice';
import { VoiceAllocator } from './VoiceAllocator';

const LFO_INDICES = [1, 2, 3] as const;
const NOISE_COLOURS = ['white', 'pink', 'brown'] as const;

interface LfoNodes {
  readonly oscillator: OscillatorNodePort;
  readonly depth: GainNodePort;
}

function equalPowerGains(position: number): readonly [number, number] {
  const safePosition = Math.min(1, Math.max(0, position));
  return [
    Math.cos((safePosition * Math.PI) / 2),
    Math.sin((safePosition * Math.PI) / 2),
  ];
}

function createSaturationCurve(amount: number): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(1024);
  const safeAmount = Math.min(1, Math.max(0, amount));
  const drive = safeAmount * 20;
  const normaliser = Math.tanh(drive);

  for (let index = 0; index < curve.length; index += 1) {
    const input = (index / (curve.length - 1)) * 2 - 1;
    curve[index] = drive === 0 ? input : Math.tanh(input * drive) / normaliser;
  }

  return curve;
}

export class SynthGraph {
  readonly analyser: AnalyserNodePort;
  readonly voiceCapacity: number;

  private readonly nodes: AudioNodePort[] = [];
  private readonly runningSources: Array<
    OscillatorNodePort | AudioBufferSourceNodePort
  > = [];
  private readonly voices: Voice[];
  private readonly allocator: VoiceAllocator;
  private readonly noiseGains = new Map<NoiseColour, GainNodePort>();
  private readonly lfos = new Map<LfoIndex, LfoNodes>();
  private readonly delay: ReturnType<AudioContextPort['createDelay']>;
  private readonly feedback: GainNodePort;
  private readonly feedbackFilter: ReturnType<
    AudioContextPort['createBiquadFilter']
  >;
  private readonly dry: GainNodePort;
  private readonly wet: GainNodePort;
  private readonly saturation: ReturnType<AudioContextPort['createWaveShaper']>;
  private patch: ParameterValues;
  private disposed = false;

  constructor(
    private readonly context: AudioContextPort,
    patch: ParameterValues,
    random: RandomSource,
  ) {
    this.patch = patch;
    this.voiceCapacity =
      patch['performance.voiceMode'] === 'mono'
        ? 1
        : patch['performance.voiceCount'];
    this.allocator = new VoiceAllocator(this.voiceCapacity);

    const voiceBus = this.track(context.createGain());
    const delayInput = this.track(context.createGain());
    this.delay = this.track(context.createDelay(2));
    this.feedback = this.track(context.createGain());
    this.feedbackFilter = this.track(context.createBiquadFilter());
    this.dry = this.track(context.createGain());
    this.wet = this.track(context.createGain());
    this.saturation = this.track(context.createWaveShaper());
    const delayOutput = this.track(context.createGain());

    setAudioParam(
      voiceBus.gain,
      1 / Math.sqrt(this.voiceCapacity),
      context.currentTime,
    );
    voiceBus.connect(delayInput);
    delayInput.connect(this.dry);
    this.dry.connect(delayOutput);
    delayInput.connect(this.delay);
    this.delay.connect(this.saturation);
    this.saturation.connect(this.wet);
    this.wet.connect(delayOutput);
    this.delay.connect(this.feedback);
    this.feedback.connect(this.feedbackFilter);
    this.feedbackFilter.connect(this.delay);

    const compressor = this.track(context.createDynamicsCompressor());
    const master = this.track(context.createGain());
    this.analyser = this.track(context.createAnalyser());
    setAudioParam(compressor.threshold, -12, context.currentTime);
    setAudioParam(compressor.knee, 12, context.currentTime);
    setAudioParam(compressor.ratio, 8, context.currentTime);
    setAudioParam(compressor.attack, 0.003, context.currentTime);
    setAudioParam(compressor.release, 0.2, context.currentTime);
    setAudioParam(master.gain, 0.7, context.currentTime);
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    delayOutput.connect(compressor);
    compressor.connect(master);
    master.connect(this.analyser);
    this.analyser.connect(context.destination);

    this.voices = Array.from(
      { length: this.voiceCapacity },
      () => new Voice(context, voiceBus, patch),
    );

    for (const colour of NOISE_COLOURS) {
      const source = this.track(context.createBufferSource());
      const colourGain = this.track(context.createGain());
      source.buffer = createNoiseBuffer(context, colour, random);
      source.loop = true;
      source.connect(colourGain);
      for (const voice of this.voices) {
        colourGain.connect(voice.noiseDestination);
      }
      this.noiseGains.set(colour, colourGain);
      this.startSource(source);
    }

    for (const index of LFO_INDICES) {
      const oscillator = this.track(context.createOscillator());
      const depth = this.track(context.createGain());
      oscillator.connect(depth);
      this.lfos.set(index, { oscillator, depth });
      this.startSource(oscillator);
    }

    this.applyPatch(patch);
  }

  applyPatch(patch: ParameterValues): void {
    this.patch = patch;
    for (const voice of this.voices) voice.applyPatch(patch);
    this.applyNoiseColour();
    for (const index of LFO_INDICES) this.applyLfo(index);
    this.applyDelay();
  }

  applyParameter(id: ParameterId, patch: ParameterValues): void {
    this.patch = patch;
    for (const voice of this.voices) voice.applyParameter(id, patch);
    if (id === 'noise.colour') {
      this.applyNoiseColour();
      return;
    }
    const lfoMatch = /^lfo\.([123])\./u.exec(id);
    if (lfoMatch?.[1]) {
      this.applyLfo(Number(lfoMatch[1]) as LfoIndex);
      return;
    }
    if (id.startsWith('delay.')) this.applyDelay();
  }

  triggerNote(note: number, velocity: number, glide: boolean): void {
    if (this.patch['performance.voiceMode'] === 'mono') {
      this.voices[0]?.triggerNote(note, velocity, glide);
      return;
    }
    const allocation = this.allocator.allocate(note);
    const voice = this.voices[allocation.index];
    if (!voice) return;
    if (allocation.stolen) voice.stealAndTrigger(note, velocity);
    else voice.triggerNote(note, velocity, false);
  }

  releaseNote(note?: number): void {
    if (this.patch['performance.voiceMode'] === 'mono') {
      this.voices[0]?.releaseNote();
      return;
    }
    if (note === undefined) return;
    const index = this.allocator.release(note);
    if (index !== null) this.voices[index]?.releaseNote();
  }

  releaseAllNotes(): void {
    if (this.patch['performance.voiceMode'] === 'mono') {
      this.voices[0]?.releaseNote();
      return;
    }
    for (const index of this.allocator.releaseAll()) {
      this.voices[index]?.releaseNote();
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const voice of this.voices) voice.dispose();
    for (const source of this.runningSources) {
      try {
        source.stop(this.context.currentTime);
      } catch {
        // A source may already have stopped during context shutdown.
      }
    }
    for (const node of this.nodes) node.disconnect();
  }

  private track<Node extends AudioNodePort>(node: Node): Node {
    this.nodes.push(node);
    return node;
  }

  private startSource(
    source: OscillatorNodePort | AudioBufferSourceNodePort,
  ): void {
    source.start(this.context.currentTime);
    this.runningSources.push(source);
  }

  private requireLfo(index: LfoIndex): LfoNodes {
    const lfo = this.lfos.get(index);
    if (!lfo) throw new Error(`Missing LFO ${index}.`);
    return lfo;
  }

  private applyNoiseColour(): void {
    const selected = this.patch['noise.colour'];
    for (const colour of NOISE_COLOURS) {
      const gain = this.noiseGains.get(colour);
      if (gain) {
        setAudioParam(
          gain.gain,
          colour === selected ? 1 : 0,
          this.context.currentTime,
        );
      }
    }
  }

  private applyLfo(index: LfoIndex): void {
    const lfo = this.requireLfo(index);
    const now = this.context.currentTime;
    lfo.oscillator.type = this.patch[`lfo.${index}.waveform`];
    setAudioParam(
      lfo.oscillator.frequency,
      this.patch[`lfo.${index}.rate`],
      now,
    );
    lfo.depth.disconnect();

    const target = this.patch[`lfo.${index}.target`];
    const range =
      target === 'none' ? 0 : (PARAMETER_REGISTRY[target].modulationRange ?? 0);
    setAudioParam(
      lfo.depth.gain,
      this.patch[`lfo.${index}.depth`] * range,
      now,
    );
    this.connectLfo(lfo.depth, target);
  }

  private connectLfo(depth: GainNodePort, target: LfoTarget): void {
    if (target === 'none') return;
    for (const voice of this.voices) {
      const parameter = voice.resolveLfoTarget(target);
      if (parameter) depth.connect(parameter);
    }
  }

  private applyDelay(): void {
    const now = this.context.currentTime;
    const enabled = this.patch['delay.enabled'];
    const mix = enabled ? this.patch['delay.mix'] : 0;
    const [dry, wet] = equalPowerGains(mix);
    setAudioParam(this.delay.delayTime, this.patch['delay.time'], now);
    setAudioParam(this.feedback.gain, this.patch['delay.feedback'], now);
    this.feedbackFilter.type = 'lowpass';
    setAudioParam(
      this.feedbackFilter.frequency,
      this.patch['delay.feedbackCutoff'],
      now,
    );
    setAudioParam(this.dry.gain, dry, now);
    setAudioParam(this.wet.gain, wet, now);
    this.saturation.curve = createSaturationCurve(
      this.patch['delay.saturation'],
    );
    this.saturation.oversample = '2x';
  }
}

import { PARAMETER_REGISTRY, type ParameterValues } from '../synth/parameters';
import { midiNoteToFrequency, transposeMidiNote } from '../synth/music';
import type {
  FilterIndex,
  LfoIndex,
  LfoTarget,
  MixerSourceId,
  NoiseColour,
  OscillatorIndex,
  ParameterId,
} from '../synth/types';
import type {
  AnalyserNodePort,
  AudioBufferSourceNodePort,
  AudioContextPort,
  AudioNodePort,
  AudioParamPort,
  BiquadFilterNodePort,
  GainNodePort,
  OscillatorNodePort,
} from './contracts';
import { createNoiseBuffer, type RandomSource } from './graph/noise';
import {
  scheduleAttackDecay,
  scheduleRelease,
  setAudioParam,
} from './scheduling/adsr';

const OSCILLATOR_INDICES = [1, 2, 3] as const;
const FILTER_INDICES = [1, 2] as const;
const LFO_INDICES = [1, 2, 3] as const;
const MIXER_SOURCE_IDS = [
  'oscillator.1',
  'oscillator.2',
  'oscillator.3',
  'noise',
] as const;
const NOISE_COLOURS = ['white', 'pink', 'brown'] as const;

interface RoutedSource {
  readonly level: GainNodePort;
  readonly filterOne: GainNodePort;
  readonly filterTwo: GainNodePort;
}

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

  private readonly nodes: AudioNodePort[] = [];
  private readonly runningSources: Array<
    OscillatorNodePort | AudioBufferSourceNodePort
  > = [];
  private readonly oscillators = new Map<OscillatorIndex, OscillatorNodePort>();
  private readonly routedSources = new Map<MixerSourceId, RoutedSource>();
  private readonly noiseGains = new Map<NoiseColour, GainNodePort>();
  private readonly filters = new Map<FilterIndex, BiquadFilterNodePort>();
  private readonly lfos = new Map<LfoIndex, LfoNodes>();
  private readonly amp: GainNodePort;
  private readonly delayInput: GainNodePort;
  private readonly delay: ReturnType<AudioContextPort['createDelay']>;
  private readonly feedback: GainNodePort;
  private readonly feedbackFilter: BiquadFilterNodePort;
  private readonly dry: GainNodePort;
  private readonly wet: GainNodePort;
  private readonly saturation: ReturnType<AudioContextPort['createWaveShaper']>;
  private patch: ParameterValues;
  private activeNote: number | null = null;
  private activeVelocity = 0;
  private disposed = false;

  constructor(
    private readonly context: AudioContextPort,
    patch: ParameterValues,
    random: RandomSource,
  ) {
    this.patch = patch;

    const filterOne = this.track(context.createBiquadFilter());
    const filterTwo = this.track(context.createBiquadFilter());
    this.filters.set(1, filterOne);
    this.filters.set(2, filterTwo);

    this.amp = this.track(context.createGain());
    this.amp.gain.value = 0;
    filterOne.connect(this.amp);
    filterTwo.connect(this.amp);

    this.delayInput = this.track(context.createGain());
    this.delay = this.track(context.createDelay(2));
    this.feedback = this.track(context.createGain());
    this.feedbackFilter = this.track(context.createBiquadFilter());
    this.dry = this.track(context.createGain());
    this.wet = this.track(context.createGain());
    this.saturation = this.track(context.createWaveShaper());
    const delayOutput = this.track(context.createGain());

    this.amp.connect(this.delayInput);
    this.delayInput.connect(this.dry);
    this.dry.connect(delayOutput);
    this.delayInput.connect(this.delay);
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

    for (const sourceId of MIXER_SOURCE_IDS) {
      const level = this.track(context.createGain());
      const routeOne = this.track(context.createGain());
      const routeTwo = this.track(context.createGain());
      level.connect(routeOne);
      level.connect(routeTwo);
      routeOne.connect(filterOne);
      routeTwo.connect(filterTwo);
      this.routedSources.set(sourceId, {
        level,
        filterOne: routeOne,
        filterTwo: routeTwo,
      });
    }

    for (const index of OSCILLATOR_INDICES) {
      const oscillator = this.track(context.createOscillator());
      oscillator.connect(this.requireSource(`oscillator.${index}`).level);
      this.oscillators.set(index, oscillator);
      this.startSource(oscillator);
    }

    for (const colour of NOISE_COLOURS) {
      const source = this.track(context.createBufferSource());
      const colourGain = this.track(context.createGain());
      source.buffer = createNoiseBuffer(context, colour, random);
      source.loop = true;
      source.connect(colourGain);
      colourGain.connect(this.requireSource('noise').level);
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

  private requireSource(sourceId: MixerSourceId): RoutedSource {
    const source = this.routedSources.get(sourceId);
    if (!source) {
      throw new Error(`Missing mixer source ${sourceId}.`);
    }
    return source;
  }

  private requireFilter(index: FilterIndex): BiquadFilterNodePort {
    const filter = this.filters.get(index);
    if (!filter) {
      throw new Error(`Missing filter ${index}.`);
    }
    return filter;
  }

  private requireOscillator(index: OscillatorIndex): OscillatorNodePort {
    const oscillator = this.oscillators.get(index);
    if (!oscillator) {
      throw new Error(`Missing oscillator ${index}.`);
    }
    return oscillator;
  }

  private requireLfo(index: LfoIndex): LfoNodes {
    const lfo = this.lfos.get(index);
    if (!lfo) {
      throw new Error(`Missing LFO ${index}.`);
    }
    return lfo;
  }

  applyPatch(patch: ParameterValues): void {
    this.patch = patch;
    for (const index of OSCILLATOR_INDICES) this.applyOscillator(index);
    this.applyNoiseColour();
    for (const sourceId of MIXER_SOURCE_IDS) this.applyMixerSource(sourceId);
    for (const index of FILTER_INDICES) this.applyFilter(index);
    for (const index of LFO_INDICES) this.applyLfo(index);
    this.applyDelay();

    if (this.activeNote !== null) {
      this.updatePitch(this.activeNote, false);
      this.triggerEnvelopes(this.activeVelocity);
    }
  }

  applyParameter(id: ParameterId, patch: ParameterValues): void {
    this.patch = patch;
    const oscillatorMatch = /^oscillator\.([123])\./u.exec(id);
    if (oscillatorMatch?.[1]) {
      this.applyOscillator(Number(oscillatorMatch[1]) as OscillatorIndex);
      return;
    }
    if (id === 'noise.colour') {
      this.applyNoiseColour();
      return;
    }
    const mixerMatch = /^mixer\.(oscillator\.[123]|noise)\./u.exec(id);
    if (mixerMatch?.[1]) {
      this.applyMixerSource(mixerMatch[1] as MixerSourceId);
      return;
    }
    const filterMatch = /^filter\.([12])\./u.exec(id);
    if (filterMatch?.[1]) {
      this.applyFilter(Number(filterMatch[1]) as FilterIndex);
      return;
    }
    const lfoMatch = /^lfo\.([123])\./u.exec(id);
    if (lfoMatch?.[1]) {
      this.applyLfo(Number(lfoMatch[1]) as LfoIndex);
      return;
    }
    if (id.startsWith('delay.')) {
      this.applyDelay();
    }
  }

  private applyOscillator(index: OscillatorIndex): void {
    const oscillator = this.requireOscillator(index);
    oscillator.type = this.patch[`oscillator.${index}.waveform`];
    setAudioParam(
      oscillator.detune,
      this.patch[`oscillator.${index}.detune`],
      this.context.currentTime,
    );
    if (this.activeNote !== null) this.updatePitch(this.activeNote, false);
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

  private applyMixerSource(sourceId: MixerSourceId): void {
    const source = this.requireSource(sourceId);
    const enabled = this.patch[`mixer.${sourceId}.enabled`];
    const level = this.patch[`mixer.${sourceId}.level`];
    const balance = this.patch[`mixer.${sourceId}.filterBalance`];
    const [filterOne, filterTwo] = equalPowerGains((balance + 1) / 2);
    const now = this.context.currentTime;
    setAudioParam(source.level.gain, enabled ? level : 0, now);
    setAudioParam(source.filterOne.gain, filterOne, now);
    setAudioParam(source.filterTwo.gain, filterTwo, now);
  }

  private applyFilter(index: FilterIndex): void {
    const filter = this.requireFilter(index);
    const now = this.context.currentTime;
    filter.type = this.patch[`filter.${index}.type`];
    setAudioParam(filter.frequency, this.patch[`filter.${index}.cutoff`], now);
    setAudioParam(filter.Q, this.patch[`filter.${index}.resonance`], now);
    setAudioParam(filter.gain, this.patch[`filter.${index}.gain`], now);
    if (this.activeNote !== null) this.triggerFilterEnvelope(index);
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
    const targetParameter = this.resolveLfoTarget(target);
    const range =
      target === 'none' ? 0 : (PARAMETER_REGISTRY[target].modulationRange ?? 0);
    setAudioParam(
      lfo.depth.gain,
      this.patch[`lfo.${index}.depth`] * range,
      now,
    );
    if (targetParameter) lfo.depth.connect(targetParameter);
  }

  private resolveLfoTarget(target: LfoTarget): AudioParamPort | null {
    if (target === 'none') return null;
    const oscillatorMatch = /^oscillator\.([123])\.detune$/u.exec(target);
    if (oscillatorMatch?.[1]) {
      return this.requireOscillator(
        Number(oscillatorMatch[1]) as OscillatorIndex,
      ).detune;
    }
    const filterMatch = /^filter\.([12])\.cutoff$/u.exec(target);
    if (filterMatch?.[1]) {
      return this.requireFilter(Number(filterMatch[1]) as FilterIndex)
        .frequency;
    }
    return null;
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

  triggerNote(note: number, velocity: number, glide: boolean): void {
    this.activeNote = note;
    this.activeVelocity = Math.min(1, Math.max(0, velocity));
    this.updatePitch(note, glide);
    this.triggerEnvelopes(this.activeVelocity);
  }

  private updatePitch(note: number, glide: boolean): void {
    const now = this.context.currentTime;
    const portamento = this.patch['performance.portamento'];
    for (const index of OSCILLATOR_INDICES) {
      const transposed = transposeMidiNote(
        note,
        this.patch[`oscillator.${index}.octave`],
      );
      const frequency = midiNoteToFrequency(transposed);
      const parameter = this.requireOscillator(index).frequency;
      parameter.cancelScheduledValues(now);
      if (glide && portamento > 0) {
        parameter.setTargetAtTime(frequency, now, Math.max(0.001, portamento));
      } else {
        parameter.setValueAtTime(frequency, now);
      }
    }
  }

  private triggerEnvelopes(velocity: number): void {
    const now = this.context.currentTime;
    scheduleAttackDecay(
      this.amp.gain,
      {
        attack: this.patch['amp.envelope.attack'],
        decay: this.patch['amp.envelope.decay'],
        peak: velocity,
        sustain: velocity * this.patch['amp.envelope.sustain'],
      },
      now,
    );
    for (const index of FILTER_INDICES) this.triggerFilterEnvelope(index);
  }

  private triggerFilterEnvelope(index: FilterIndex): void {
    const base = this.patch[`filter.${index}.cutoff`];
    const amount = this.patch[`filter.${index}.envelope.amount`];
    const definition = PARAMETER_REGISTRY[`filter.${index}.cutoff`];
    const peak =
      amount >= 0
        ? base + (definition.maximum - base) * amount
        : base + (base - definition.minimum) * amount;
    const sustainAmount = this.patch[`filter.${index}.envelope.sustain`];
    scheduleAttackDecay(
      this.requireFilter(index).frequency,
      {
        attack: this.patch[`filter.${index}.envelope.attack`],
        decay: this.patch[`filter.${index}.envelope.decay`],
        peak,
        sustain: base + (peak - base) * sustainAmount,
      },
      this.context.currentTime,
    );
  }

  releaseNote(): void {
    const now = this.context.currentTime;
    scheduleRelease(this.amp.gain, 0, this.patch['amp.envelope.release'], now);
    for (const index of FILTER_INDICES) {
      scheduleRelease(
        this.requireFilter(index).frequency,
        this.patch[`filter.${index}.cutoff`],
        this.patch[`filter.${index}.envelope.release`],
        now,
      );
    }
    this.activeNote = null;
    this.activeVelocity = 0;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const source of this.runningSources) {
      try {
        source.stop(this.context.currentTime);
      } catch {
        // A source may already have stopped during context shutdown.
      }
    }
    for (const node of this.nodes) node.disconnect();
  }
}

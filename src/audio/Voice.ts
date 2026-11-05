import { midiNoteToFrequency, transposeMidiNote } from '../synth/music';
import { PARAMETER_REGISTRY, type ParameterValues } from '../synth/parameters';
import type {
  FilterIndex,
  LfoTarget,
  MixerSourceId,
  OscillatorIndex,
  ParameterId,
} from '../synth/types';
import type {
  AudioContextPort,
  AudioNodePort,
  AudioParamPort,
  BiquadFilterNodePort,
  GainNodePort,
  OscillatorNodePort,
} from './contracts';
import {
  scheduleAttackDecay,
  scheduleRelease,
  setAudioParam,
} from './scheduling/adsr';

const OSCILLATOR_INDICES = [1, 2, 3] as const;
const FILTER_INDICES = [1, 2] as const;
const MIXER_SOURCE_IDS = [
  'oscillator.1',
  'oscillator.2',
  'oscillator.3',
  'noise',
] as const;
const STEAL_FADE_SECONDS = 0.005;

interface RoutedSource {
  readonly level: GainNodePort;
  readonly filterOne: GainNodePort;
  readonly filterTwo: GainNodePort;
}

function equalPowerGains(position: number): readonly [number, number] {
  const safePosition = Math.min(1, Math.max(0, position));
  return [
    Math.cos((safePosition * Math.PI) / 2),
    Math.sin((safePosition * Math.PI) / 2),
  ];
}

export class Voice {
  private readonly nodes: AudioNodePort[] = [];
  private readonly oscillators = new Map<OscillatorIndex, OscillatorNodePort>();
  private readonly routedSources = new Map<MixerSourceId, RoutedSource>();
  private readonly filters = new Map<FilterIndex, BiquadFilterNodePort>();
  private readonly amp: GainNodePort;
  private patch: ParameterValues;
  private activeNote: number | null = null;
  private activeVelocity = 0;
  private disposed = false;

  constructor(
    private readonly context: AudioContextPort,
    output: AudioNodePort,
    patch: ParameterValues,
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
    this.amp.connect(output);

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
      oscillator.start(context.currentTime);
    }
  }

  get noiseDestination(): AudioNodePort {
    return this.requireSource('noise').level;
  }

  resolveLfoTarget(target: LfoTarget): AudioParamPort | null {
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

  applyPatch(patch: ParameterValues): void {
    this.patch = patch;
    for (const index of OSCILLATOR_INDICES) this.applyOscillator(index);
    for (const sourceId of MIXER_SOURCE_IDS) this.applyMixerSource(sourceId);
    for (const index of FILTER_INDICES) this.applyFilter(index);
    if (this.activeNote !== null) {
      this.updatePitch(this.activeNote, false, this.context.currentTime);
      this.triggerEnvelopes(this.activeVelocity, this.context.currentTime);
    }
  }

  applyParameter(id: ParameterId, patch: ParameterValues): void {
    this.patch = patch;
    const oscillatorMatch = /^oscillator\.([123])\./u.exec(id);
    if (oscillatorMatch?.[1]) {
      this.applyOscillator(Number(oscillatorMatch[1]) as OscillatorIndex);
      return;
    }
    const mixerMatch = /^mixer\.(oscillator\.[123]|noise)\./u.exec(id);
    if (mixerMatch?.[1]) {
      this.applyMixerSource(mixerMatch[1] as MixerSourceId);
      return;
    }
    const filterMatch = /^filter\.([12])\./u.exec(id);
    if (filterMatch?.[1]) {
      const index = Number(filterMatch[1]) as FilterIndex;
      this.applyFilter(index);
      if (this.activeNote !== null) this.triggerFilterEnvelope(index);
    }
  }

  triggerNote(
    note: number,
    velocity: number,
    glide: boolean,
    when = this.context.currentTime,
  ): void {
    this.activeNote = note;
    this.activeVelocity = Math.min(1, Math.max(0, velocity));
    this.updatePitch(note, glide, when);
    this.triggerEnvelopes(this.activeVelocity, when);
  }

  stealAndTrigger(note: number, velocity: number): void {
    const now = this.context.currentTime;
    scheduleRelease(this.amp.gain, 0, STEAL_FADE_SECONDS, now);
    for (const index of FILTER_INDICES) {
      scheduleRelease(
        this.requireFilter(index).frequency,
        this.patch[`filter.${index}.cutoff`],
        STEAL_FADE_SECONDS,
        now,
      );
    }
    this.triggerNote(note, velocity, false, now + STEAL_FADE_SECONDS);
  }

  releaseNote(): void {
    if (this.activeNote === null) return;
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
    for (const oscillator of this.oscillators.values()) {
      try {
        oscillator.stop(this.context.currentTime);
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

  private requireSource(sourceId: MixerSourceId): RoutedSource {
    const source = this.routedSources.get(sourceId);
    if (!source) throw new Error(`Missing mixer source ${sourceId}.`);
    return source;
  }

  private requireFilter(index: FilterIndex): BiquadFilterNodePort {
    const filter = this.filters.get(index);
    if (!filter) throw new Error(`Missing filter ${index}.`);
    return filter;
  }

  private requireOscillator(index: OscillatorIndex): OscillatorNodePort {
    const oscillator = this.oscillators.get(index);
    if (!oscillator) throw new Error(`Missing oscillator ${index}.`);
    return oscillator;
  }

  private applyOscillator(index: OscillatorIndex): void {
    const oscillator = this.requireOscillator(index);
    oscillator.type = this.patch[`oscillator.${index}.waveform`];
    setAudioParam(
      oscillator.detune,
      this.patch[`oscillator.${index}.detune`],
      this.context.currentTime,
    );
    if (this.activeNote !== null) {
      this.updatePitch(this.activeNote, false, this.context.currentTime);
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
  }

  private updatePitch(note: number, glide: boolean, when: number): void {
    const portamento = this.patch['performance.portamento'];
    for (const index of OSCILLATOR_INDICES) {
      const frequency = midiNoteToFrequency(
        transposeMidiNote(note, this.patch[`oscillator.${index}.octave`]),
      );
      const parameter = this.requireOscillator(index).frequency;
      parameter.cancelScheduledValues(when);
      if (glide && portamento > 0) {
        parameter.setTargetAtTime(frequency, when, Math.max(0.001, portamento));
      } else {
        parameter.setValueAtTime(frequency, when);
      }
    }
  }

  private triggerEnvelopes(velocity: number, when: number): void {
    scheduleAttackDecay(
      this.amp.gain,
      {
        attack: this.patch['amp.envelope.attack'],
        decay: this.patch['amp.envelope.decay'],
        peak: velocity,
        sustain: velocity * this.patch['amp.envelope.sustain'],
      },
      when,
    );
    for (const index of FILTER_INDICES) this.triggerFilterEnvelope(index, when);
  }

  private triggerFilterEnvelope(
    index: FilterIndex,
    when = this.context.currentTime,
  ): void {
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
      when,
    );
  }
}

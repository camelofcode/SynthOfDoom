import {
  FILTER_TYPES,
  NOISE_COLOURS,
  OSCILLATOR_WAVEFORMS,
  VOICE_MODES,
  type FilterType,
  type LfoTarget,
  type NoiseColour,
  type OscillatorWaveform,
  type ParameterId,
  type VoiceMode,
} from './types';

export type ParameterScale =
  | { readonly kind: 'linear' }
  | { readonly kind: 'logarithmic' }
  | { readonly kind: 'exponential'; readonly exponent: number }
  | { readonly kind: 'bipolar' };

export type ParameterUnit =
  | 'boolean'
  | 'cents'
  | 'decibels'
  | 'enum'
  | 'hertz'
  | 'octaves'
  | 'percent'
  | 'q'
  | 'seconds'
  | 'voices';

interface ParameterDefinitionBase<Id extends ParameterId> {
  readonly id: Id;
  readonly label: string;
  readonly group: string;
  readonly unit: ParameterUnit;
  readonly midiLearnable: boolean;
}

export interface NumericParameterDefinition<
  Id extends ParameterId = ParameterId,
> extends ParameterDefinitionBase<Id> {
  readonly kind: 'number';
  readonly minimum: number;
  readonly maximum: number;
  readonly defaultValue: number;
  readonly step: number;
  readonly scale: ParameterScale;
  readonly modulationRange: number | null;
  readonly formatValue: (value: number) => string;
}

export interface BooleanParameterDefinition<
  Id extends ParameterId = ParameterId,
> extends ParameterDefinitionBase<Id> {
  readonly kind: 'boolean';
  readonly unit: 'boolean';
  readonly defaultValue: boolean;
  readonly modulationRange: null;
  readonly formatValue: (value: boolean) => string;
}

export interface EnumOption<Value extends string = string> {
  readonly value: Value;
  readonly label: string;
}

export interface EnumParameterDefinition<
  Id extends ParameterId = ParameterId,
  Value extends string = string,
> extends ParameterDefinitionBase<Id> {
  readonly kind: 'enum';
  readonly unit: 'enum';
  readonly defaultValue: Value;
  readonly options: readonly EnumOption<Value>[];
  readonly modulationRange: null;
  readonly formatValue: (value: string) => string;
}

export type ParameterDefinition<Id extends ParameterId = ParameterId> =
  | NumericParameterDefinition<Id>
  | BooleanParameterDefinition<Id>
  | EnumParameterDefinition<Id>;

const linear: ParameterScale = { kind: 'linear' };
const logarithmic: ParameterScale = { kind: 'logarithmic' };
const bipolar: ParameterScale = { kind: 'bipolar' };
const timeCurve: ParameterScale = { kind: 'exponential', exponent: 2 };

function formatNumber(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat('en-GB', {
    maximumFractionDigits,
  }).format(value);
}

const formatters = {
  cents: (value: number) => `${value > 0 ? '+' : ''}${formatNumber(value)} ct`,
  decibels: (value: number) =>
    `${value > 0 ? '+' : ''}${formatNumber(value, 1)} dB`,
  frequency: (value: number) =>
    value >= 1000
      ? `${formatNumber(value / 1000, 2)} kHz`
      : `${formatNumber(value, 1)} Hz`,
  hertz: (value: number) => `${formatNumber(value, 1)} Hz`,
  octave: (value: number) =>
    value === 0 ? 'Original' : `${value > 0 ? '+' : ''}${value} octave`,
  percent: (value: number) => `${Math.round(value * 100)}%`,
  q: (value: number) => formatNumber(value, 1),
  seconds: (value: number) =>
    value < 1
      ? `${Math.round(value * 1000)} ms`
      : `${formatNumber(value, 2)} s`,
  voices: (value: number) =>
    `${Math.round(value)} voice${Math.round(value) === 1 ? '' : 's'}`,
} as const;

function formatFilterBalance(value: number): string {
  const safeValue = Math.min(1, Math.max(-1, value));
  const filterTwo = Math.round(((safeValue + 1) / 2) * 100);
  return `${100 - filterTwo}% F1 / ${filterTwo}% F2`;
}

function numeric<Id extends ParameterId>(
  definition: Omit<NumericParameterDefinition<Id>, 'kind'>,
): NumericParameterDefinition<Id> {
  return { kind: 'number', ...definition };
}

function bool<Id extends ParameterId>(
  definition: Omit<
    BooleanParameterDefinition<Id>,
    'kind' | 'unit' | 'modulationRange' | 'formatValue'
  >,
): BooleanParameterDefinition<Id> {
  return {
    kind: 'boolean',
    unit: 'boolean',
    modulationRange: null,
    formatValue: (value) => (value ? 'On' : 'Off'),
    ...definition,
  };
}

function enumeration<Id extends ParameterId, Value extends string>(
  definition: Omit<
    EnumParameterDefinition<Id, Value>,
    'kind' | 'unit' | 'modulationRange' | 'formatValue'
  >,
): EnumParameterDefinition<Id, Value> {
  return {
    kind: 'enum',
    unit: 'enum',
    modulationRange: null,
    formatValue: (value) =>
      definition.options.find((option) => option.value === value)?.label ??
      value,
    ...definition,
  };
}

const waveformOptions = OSCILLATOR_WAVEFORMS.map((value) => ({
  value,
  label: `${value.charAt(0).toUpperCase()}${value.slice(1)}`,
})) satisfies readonly EnumOption<OscillatorWaveform>[];

const filterTypeLabels: Record<FilterType, string> = {
  lowpass: 'Low-pass',
  highpass: 'High-pass',
  bandpass: 'Band-pass',
  lowshelf: 'Low-shelf',
  highshelf: 'High-shelf',
  peaking: 'Peaking',
  notch: 'Notch',
  allpass: 'All-pass',
};

const filterTypeOptions = FILTER_TYPES.map((value) => ({
  value,
  label: filterTypeLabels[value],
})) satisfies readonly EnumOption<FilterType>[];

const noiseColourOptions = NOISE_COLOURS.map((value) => ({
  value,
  label: `${value.charAt(0).toUpperCase()}${value.slice(1)}`,
})) satisfies readonly EnumOption<NoiseColour>[];

const voiceModeLabels: Record<VoiceMode, string> = {
  poly: 'Polyphonic',
  mono: 'Monophonic',
};

const voiceModeOptions = VOICE_MODES.map((value) => ({
  value,
  label: voiceModeLabels[value],
})) satisfies readonly EnumOption<VoiceMode>[];

const octaveOptions = [-2, -1, 0, 1, 2] as const;

const lfoTargetOptions: readonly EnumOption<LfoTarget>[] = [
  { value: 'none', label: 'None' },
  { value: 'oscillator.1.detune', label: 'Oscillator 1 detune' },
  { value: 'oscillator.2.detune', label: 'Oscillator 2 detune' },
  { value: 'oscillator.3.detune', label: 'Oscillator 3 detune' },
  { value: 'filter.1.cutoff', label: 'Filter 1 cutoff' },
  { value: 'filter.2.cutoff', label: 'Filter 2 cutoff' },
];

const oscillatorWaveform = <Id extends ParameterId>(
  id: Id,
  group: string,
): EnumParameterDefinition<Id, OscillatorWaveform> =>
  enumeration({
    id,
    label: 'Waveform',
    group,
    defaultValue: 'sawtooth',
    options: waveformOptions,
    midiLearnable: false,
  });

const oscillatorOctave = <Id extends ParameterId>(
  id: Id,
  group: string,
): NumericParameterDefinition<Id> =>
  numeric({
    id,
    label: 'Octave',
    group,
    unit: 'octaves',
    minimum: -2,
    maximum: 2,
    defaultValue: 0,
    step: 1,
    scale: linear,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatters.octave,
  });

const oscillatorDetune = <Id extends ParameterId>(
  id: Id,
  group: string,
): NumericParameterDefinition<Id> =>
  numeric({
    id,
    label: 'Detune',
    group,
    unit: 'cents',
    minimum: -100,
    maximum: 100,
    defaultValue: 0,
    step: 1,
    scale: bipolar,
    modulationRange: 100,
    midiLearnable: true,
    formatValue: formatters.cents,
  });

const mixerEnabled = <Id extends ParameterId>(
  id: Id,
  group: string,
): BooleanParameterDefinition<Id> =>
  bool({
    id,
    label: 'Enabled',
    group,
    defaultValue: true,
    midiLearnable: true,
  });

const mixerLevel = <Id extends ParameterId>(
  id: Id,
  group: string,
): NumericParameterDefinition<Id> =>
  numeric({
    id,
    label: 'Level',
    group,
    unit: 'percent',
    minimum: 0,
    maximum: 1,
    defaultValue: 0.8,
    step: 0.01,
    scale: linear,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatters.percent,
  });

const mixerBalance = <Id extends ParameterId>(
  id: Id,
  group: string,
): NumericParameterDefinition<Id> =>
  numeric({
    id,
    label: 'Filter balance',
    group,
    unit: 'percent',
    minimum: -1,
    maximum: 1,
    defaultValue: 0,
    step: 0.01,
    scale: bipolar,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatFilterBalance,
  });

const filterType = <Id extends ParameterId>(
  id: Id,
  group: string,
): EnumParameterDefinition<Id, FilterType> =>
  enumeration({
    id,
    label: 'Type',
    group,
    defaultValue: 'lowpass',
    options: filterTypeOptions,
    midiLearnable: false,
  });

const filterCutoff = <Id extends ParameterId>(
  id: Id,
  group: string,
): NumericParameterDefinition<Id> =>
  numeric({
    id,
    label: 'Cutoff',
    group,
    unit: 'hertz',
    minimum: 60,
    maximum: 10_000,
    defaultValue: 1000,
    step: 1,
    scale: logarithmic,
    modulationRange: 9940,
    midiLearnable: true,
    formatValue: formatters.frequency,
  });

const filterResonance = <Id extends ParameterId>(
  id: Id,
  group: string,
): NumericParameterDefinition<Id> =>
  numeric({
    id,
    label: 'Resonance',
    group,
    unit: 'q',
    minimum: 1,
    maximum: 16,
    defaultValue: 2,
    step: 0.1,
    scale: linear,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatters.q,
  });

const filterGain = <Id extends ParameterId>(
  id: Id,
  group: string,
): NumericParameterDefinition<Id> =>
  numeric({
    id,
    label: 'Gain',
    group,
    unit: 'decibels',
    minimum: -24,
    maximum: 24,
    defaultValue: 0,
    step: 0.1,
    scale: bipolar,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatters.decibels,
  });

const envelopeAmount = <Id extends ParameterId>(
  id: Id,
  group: string,
): NumericParameterDefinition<Id> =>
  numeric({
    id,
    label: 'Envelope amount',
    group,
    unit: 'percent',
    minimum: -1,
    maximum: 1,
    defaultValue: 0,
    step: 0.01,
    scale: bipolar,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatters.percent,
  });

const envelopeTime = <Id extends ParameterId>(
  id: Id,
  label: string,
  group: string,
): NumericParameterDefinition<Id> =>
  numeric({
    id,
    label,
    group,
    unit: 'seconds',
    minimum: 0,
    maximum: 2,
    defaultValue: 0.5,
    step: 0.01,
    scale: timeCurve,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatters.seconds,
  });

const envelopeSustain = <Id extends ParameterId>(
  id: Id,
  group: string,
): NumericParameterDefinition<Id> =>
  numeric({
    id,
    label: 'Sustain',
    group,
    unit: 'percent',
    minimum: 0,
    maximum: 1,
    defaultValue: 0.5,
    step: 0.01,
    scale: linear,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatters.percent,
  });

const lfoRate = <Id extends ParameterId>(
  id: Id,
  group: string,
): NumericParameterDefinition<Id> =>
  numeric({
    id,
    label: 'Rate',
    group,
    unit: 'hertz',
    minimum: 0.1,
    maximum: 20.1,
    defaultValue: 1,
    step: 0.1,
    scale: logarithmic,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatters.hertz,
  });

const lfoDepth = <Id extends ParameterId>(
  id: Id,
  group: string,
): NumericParameterDefinition<Id> =>
  numeric({
    id,
    label: 'Depth',
    group,
    unit: 'percent',
    minimum: 0,
    maximum: 1,
    defaultValue: 0.5,
    step: 0.01,
    scale: linear,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatters.percent,
  });

const lfoTarget = <Id extends ParameterId>(
  id: Id,
  group: string,
): EnumParameterDefinition<Id, LfoTarget> =>
  enumeration({
    id,
    label: 'Target',
    group,
    defaultValue: 'none',
    options: lfoTargetOptions,
    midiLearnable: false,
  });

export const PARAMETER_REGISTRY = Object.freeze({
  'oscillator.1.waveform': oscillatorWaveform(
    'oscillator.1.waveform',
    'Oscillator 1',
  ),
  'oscillator.1.octave': oscillatorOctave(
    'oscillator.1.octave',
    'Oscillator 1',
  ),
  'oscillator.1.detune': oscillatorDetune(
    'oscillator.1.detune',
    'Oscillator 1',
  ),
  'oscillator.2.waveform': oscillatorWaveform(
    'oscillator.2.waveform',
    'Oscillator 2',
  ),
  'oscillator.2.octave': oscillatorOctave(
    'oscillator.2.octave',
    'Oscillator 2',
  ),
  'oscillator.2.detune': oscillatorDetune(
    'oscillator.2.detune',
    'Oscillator 2',
  ),
  'oscillator.3.waveform': oscillatorWaveform(
    'oscillator.3.waveform',
    'Oscillator 3',
  ),
  'oscillator.3.octave': oscillatorOctave(
    'oscillator.3.octave',
    'Oscillator 3',
  ),
  'oscillator.3.detune': oscillatorDetune(
    'oscillator.3.detune',
    'Oscillator 3',
  ),

  'noise.colour': enumeration({
    id: 'noise.colour',
    label: 'Colour',
    group: 'Noise',
    defaultValue: 'white',
    options: noiseColourOptions,
    midiLearnable: false,
  }),

  'mixer.oscillator.1.enabled': mixerEnabled(
    'mixer.oscillator.1.enabled',
    'Oscillator 1 mixer',
  ),
  'mixer.oscillator.1.level': mixerLevel(
    'mixer.oscillator.1.level',
    'Oscillator 1 mixer',
  ),
  'mixer.oscillator.1.filterBalance': mixerBalance(
    'mixer.oscillator.1.filterBalance',
    'Oscillator 1 mixer',
  ),
  'mixer.oscillator.2.enabled': mixerEnabled(
    'mixer.oscillator.2.enabled',
    'Oscillator 2 mixer',
  ),
  'mixer.oscillator.2.level': mixerLevel(
    'mixer.oscillator.2.level',
    'Oscillator 2 mixer',
  ),
  'mixer.oscillator.2.filterBalance': mixerBalance(
    'mixer.oscillator.2.filterBalance',
    'Oscillator 2 mixer',
  ),
  'mixer.oscillator.3.enabled': mixerEnabled(
    'mixer.oscillator.3.enabled',
    'Oscillator 3 mixer',
  ),
  'mixer.oscillator.3.level': mixerLevel(
    'mixer.oscillator.3.level',
    'Oscillator 3 mixer',
  ),
  'mixer.oscillator.3.filterBalance': mixerBalance(
    'mixer.oscillator.3.filterBalance',
    'Oscillator 3 mixer',
  ),
  'mixer.noise.enabled': mixerEnabled('mixer.noise.enabled', 'Noise mixer'),
  'mixer.noise.level': mixerLevel('mixer.noise.level', 'Noise mixer'),
  'mixer.noise.filterBalance': mixerBalance(
    'mixer.noise.filterBalance',
    'Noise mixer',
  ),

  'filter.1.type': filterType('filter.1.type', 'Filter 1'),
  'filter.1.cutoff': filterCutoff('filter.1.cutoff', 'Filter 1'),
  'filter.1.resonance': filterResonance('filter.1.resonance', 'Filter 1'),
  'filter.1.gain': filterGain('filter.1.gain', 'Filter 1'),
  'filter.1.envelope.amount': envelopeAmount(
    'filter.1.envelope.amount',
    'Filter 1 envelope',
  ),
  'filter.1.envelope.attack': envelopeTime(
    'filter.1.envelope.attack',
    'Attack',
    'Filter 1 envelope',
  ),
  'filter.1.envelope.decay': envelopeTime(
    'filter.1.envelope.decay',
    'Decay',
    'Filter 1 envelope',
  ),
  'filter.1.envelope.sustain': envelopeSustain(
    'filter.1.envelope.sustain',
    'Filter 1 envelope',
  ),
  'filter.1.envelope.release': envelopeTime(
    'filter.1.envelope.release',
    'Release',
    'Filter 1 envelope',
  ),
  'filter.2.type': filterType('filter.2.type', 'Filter 2'),
  'filter.2.cutoff': filterCutoff('filter.2.cutoff', 'Filter 2'),
  'filter.2.resonance': filterResonance('filter.2.resonance', 'Filter 2'),
  'filter.2.gain': filterGain('filter.2.gain', 'Filter 2'),
  'filter.2.envelope.amount': envelopeAmount(
    'filter.2.envelope.amount',
    'Filter 2 envelope',
  ),
  'filter.2.envelope.attack': envelopeTime(
    'filter.2.envelope.attack',
    'Attack',
    'Filter 2 envelope',
  ),
  'filter.2.envelope.decay': envelopeTime(
    'filter.2.envelope.decay',
    'Decay',
    'Filter 2 envelope',
  ),
  'filter.2.envelope.sustain': envelopeSustain(
    'filter.2.envelope.sustain',
    'Filter 2 envelope',
  ),
  'filter.2.envelope.release': envelopeTime(
    'filter.2.envelope.release',
    'Release',
    'Filter 2 envelope',
  ),

  'amp.envelope.attack': envelopeTime(
    'amp.envelope.attack',
    'Attack',
    'Amplitude envelope',
  ),
  'amp.envelope.decay': envelopeTime(
    'amp.envelope.decay',
    'Decay',
    'Amplitude envelope',
  ),
  'amp.envelope.sustain': envelopeSustain(
    'amp.envelope.sustain',
    'Amplitude envelope',
  ),
  'amp.envelope.release': envelopeTime(
    'amp.envelope.release',
    'Release',
    'Amplitude envelope',
  ),

  'lfo.1.waveform': oscillatorWaveform('lfo.1.waveform', 'LFO 1'),
  'lfo.1.rate': lfoRate('lfo.1.rate', 'LFO 1'),
  'lfo.1.depth': lfoDepth('lfo.1.depth', 'LFO 1'),
  'lfo.1.target': lfoTarget('lfo.1.target', 'LFO 1'),
  'lfo.2.waveform': oscillatorWaveform('lfo.2.waveform', 'LFO 2'),
  'lfo.2.rate': lfoRate('lfo.2.rate', 'LFO 2'),
  'lfo.2.depth': lfoDepth('lfo.2.depth', 'LFO 2'),
  'lfo.2.target': lfoTarget('lfo.2.target', 'LFO 2'),
  'lfo.3.waveform': oscillatorWaveform('lfo.3.waveform', 'LFO 3'),
  'lfo.3.rate': lfoRate('lfo.3.rate', 'LFO 3'),
  'lfo.3.depth': lfoDepth('lfo.3.depth', 'LFO 3'),
  'lfo.3.target': lfoTarget('lfo.3.target', 'LFO 3'),

  'delay.enabled': bool({
    id: 'delay.enabled',
    label: 'Enabled',
    group: 'Delay',
    defaultValue: false,
    midiLearnable: true,
  }),
  'delay.time': numeric({
    id: 'delay.time',
    label: 'Time',
    group: 'Delay',
    unit: 'seconds',
    minimum: 0.01,
    maximum: 2,
    defaultValue: 0.5,
    step: 0.01,
    scale: timeCurve,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatters.seconds,
  }),
  'delay.feedback': numeric({
    id: 'delay.feedback',
    label: 'Feedback',
    group: 'Delay',
    unit: 'percent',
    minimum: 0,
    maximum: 0.95,
    defaultValue: 0.5,
    step: 0.01,
    scale: linear,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatters.percent,
  }),
  'delay.feedbackCutoff': numeric({
    id: 'delay.feedbackCutoff',
    label: 'Feedback cutoff',
    group: 'Delay',
    unit: 'hertz',
    minimum: 200,
    maximum: 5000,
    defaultValue: 1000,
    step: 1,
    scale: logarithmic,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatters.frequency,
  }),
  'delay.mix': numeric({
    id: 'delay.mix',
    label: 'Mix',
    group: 'Delay',
    unit: 'percent',
    minimum: 0,
    maximum: 1,
    defaultValue: 0.5,
    step: 0.01,
    scale: linear,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatters.percent,
  }),
  'delay.saturation': numeric({
    id: 'delay.saturation',
    label: 'Saturation',
    group: 'Delay',
    unit: 'percent',
    minimum: 0,
    maximum: 1,
    defaultValue: 0.35,
    step: 0.01,
    scale: linear,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatters.percent,
  }),

  'performance.voiceMode': enumeration({
    id: 'performance.voiceMode',
    label: 'Voice mode',
    group: 'Performance',
    defaultValue: 'poly',
    options: voiceModeOptions,
    midiLearnable: false,
  }),
  'performance.voiceCount': numeric({
    id: 'performance.voiceCount',
    label: 'Voices',
    group: 'Performance',
    unit: 'voices',
    minimum: 1,
    maximum: 8,
    defaultValue: 8,
    step: 1,
    scale: linear,
    modulationRange: null,
    midiLearnable: false,
    formatValue: formatters.voices,
  }),

  'performance.portamento': numeric({
    id: 'performance.portamento',
    label: 'Portamento',
    group: 'Performance',
    unit: 'seconds',
    minimum: 0,
    maximum: 2,
    defaultValue: 0.05,
    step: 0.01,
    scale: timeCurve,
    modulationRange: null,
    midiLearnable: true,
    formatValue: formatters.seconds,
  }),
} satisfies Record<ParameterId, ParameterDefinition>);

export type ParameterRegistry = typeof PARAMETER_REGISTRY;

type ParameterValueForDefinition<Definition> =
  Definition extends NumericParameterDefinition
    ? number
    : Definition extends BooleanParameterDefinition
      ? boolean
      : Definition extends EnumParameterDefinition<ParameterId, infer Value>
        ? Value
        : never;

export type ParameterValues = {
  readonly [Id in ParameterId]: ParameterValueForDefinition<
    ParameterRegistry[Id]
  >;
};

export type ParameterValue = ParameterValues[ParameterId];

export const PARAMETER_IDS = Object.freeze(
  Object.keys(PARAMETER_REGISTRY) as ParameterId[],
);

export const MODULATION_TARGET_IDS = Object.freeze(
  PARAMETER_IDS.filter((id) => PARAMETER_REGISTRY[id].modulationRange !== null),
);

export function isParameterId(value: string): value is ParameterId {
  return Object.hasOwn(PARAMETER_REGISTRY, value);
}

export function getParameterDefinition<Id extends ParameterId>(
  id: Id,
): ParameterRegistry[Id] {
  return PARAMETER_REGISTRY[id];
}

export function formatParameterValue<Id extends ParameterId>(
  id: Id,
  value: ParameterValues[Id],
): string {
  const definition = PARAMETER_REGISTRY[id] as ParameterDefinition;

  if (definition.kind === 'number' && typeof value === 'number') {
    return definition.formatValue(value);
  }

  if (definition.kind === 'boolean' && typeof value === 'boolean') {
    return definition.formatValue(value);
  }

  if (definition.kind === 'enum' && typeof value === 'string') {
    return definition.formatValue(value);
  }

  throw new TypeError(`Invalid value for parameter ${id}.`);
}

export { octaveOptions };

export const OSCILLATOR_WAVEFORMS = [
  'sine',
  'sawtooth',
  'square',
  'triangle',
] as const;

export type OscillatorWaveform = (typeof OSCILLATOR_WAVEFORMS)[number];

export const FILTER_TYPES = [
  'lowpass',
  'highpass',
  'bandpass',
  'lowshelf',
  'highshelf',
  'peaking',
  'notch',
  'allpass',
] as const;

export type FilterType = (typeof FILTER_TYPES)[number];

export const NOISE_COLOURS = ['white', 'pink', 'brown'] as const;

export type NoiseColour = (typeof NOISE_COLOURS)[number];

export const VOICE_MODES = ['poly', 'mono'] as const;

export type VoiceMode = (typeof VOICE_MODES)[number];

export type OscillatorIndex = 1 | 2 | 3;
export type FilterIndex = 1 | 2;
export type LfoIndex = 1 | 2 | 3;

export type MixerSourceId = `oscillator.${OscillatorIndex}` | 'noise';

export type LfoTarget =
  | 'none'
  | `oscillator.${OscillatorIndex}.detune`
  | `filter.${FilterIndex}.cutoff`;

export type OscillatorParameterId =
  `oscillator.${OscillatorIndex}.${'waveform' | 'octave' | 'detune'}`;

export type MixerParameterId =
  `mixer.${MixerSourceId}.${'enabled' | 'level' | 'filterBalance'}`;

export type FilterParameterId = `filter.${FilterIndex}.${
  | 'type'
  | 'cutoff'
  | 'resonance'
  | 'gain'
  | 'envelope.amount'
  | 'envelope.attack'
  | 'envelope.decay'
  | 'envelope.sustain'
  | 'envelope.release'}`;

export type AmpParameterId =
  `amp.envelope.${'attack' | 'decay' | 'sustain' | 'release'}`;

export type LfoParameterId =
  `lfo.${LfoIndex}.${'waveform' | 'rate' | 'depth' | 'target'}`;

export type DelayParameterId =
  `delay.${'enabled' | 'time' | 'feedback' | 'feedbackCutoff' | 'mix' | 'saturation'}`;

export type PerformanceParameterId =
  `performance.${'voiceMode' | 'voiceCount' | 'portamento'}`;

export type ParameterId =
  | OscillatorParameterId
  | 'noise.colour'
  | MixerParameterId
  | FilterParameterId
  | AmpParameterId
  | LfoParameterId
  | DelayParameterId
  | PerformanceParameterId;

export type NoteInputSource = 'computer' | 'pointer' | 'midi';

interface NoteEventBase {
  readonly note: number;
  readonly source: NoteInputSource;
  readonly sourceId: string;
}

export interface NoteOnEvent extends NoteEventBase {
  readonly type: 'note-on';
  readonly velocity: number;
}

export interface NoteOffEvent extends NoteEventBase {
  readonly type: 'note-off';
}

export interface AllNotesOffEvent {
  readonly type: 'all-notes-off';
  readonly source?: NoteInputSource;
  readonly sourceId?: string;
}

export type NoteEvent = NoteOnEvent | NoteOffEvent | AllNotesOffEvent;

interface MidiMessageBase {
  readonly channel: number;
}

export interface MidiNoteOnMessage extends MidiMessageBase {
  readonly type: 'note-on';
  readonly note: number;
  readonly velocity: number;
}

export interface MidiNoteOffMessage extends MidiMessageBase {
  readonly type: 'note-off';
  readonly note: number;
  readonly velocity: number;
}

export interface MidiControlChangeMessage extends MidiMessageBase {
  readonly type: 'control-change';
  readonly controller: number;
  readonly value: number;
}

export interface MidiUnsupportedMessage {
  readonly type: 'unsupported';
  readonly status: number;
  readonly data: readonly number[];
}

export type MidiMessage =
  | MidiNoteOnMessage
  | MidiNoteOffMessage
  | MidiControlChangeMessage
  | MidiUnsupportedMessage;

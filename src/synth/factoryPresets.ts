import {
  createDefaultPatch,
  validateSynthPatch,
  type SynthPatch,
} from './patch';
import type { ParameterValue } from './parameters';
import type { ParameterId } from './types';

export interface FactoryPreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly patch: SynthPatch;
}

function createPatch(
  overrides: Partial<Record<ParameterId, ParameterValue>>,
): SynthPatch {
  const base = createDefaultPatch();
  return validateSynthPatch({
    ...base,
    parameters: { ...base.parameters, ...overrides },
  }).patch;
}

export const FACTORY_PRESETS: readonly FactoryPreset[] = Object.freeze([
  {
    id: 'factory:init',
    name: 'Initialise',
    description: 'The documented legacy starting point.',
    patch: createDefaultPatch(),
  },
  {
    id: 'factory:doom-bass',
    name: 'Doom Bass',
    description: 'A dark monophonic bass with glide and filter movement.',
    patch: createPatch({
      'performance.voiceMode': 'mono',
      'performance.voiceCount': 1,
      'oscillator.1.octave': -1,
      'oscillator.2.waveform': 'square',
      'oscillator.2.octave': -1,
      'oscillator.2.detune': -7,
      'oscillator.3.octave': -2,
      'oscillator.3.detune': 7,
      'mixer.noise.enabled': false,
      'filter.1.cutoff': 420,
      'filter.1.resonance': 7,
      'filter.1.envelope.amount': 0.65,
      'filter.1.envelope.attack': 0.02,
      'filter.1.envelope.decay': 0.35,
      'filter.1.envelope.sustain': 0.25,
      'amp.envelope.attack': 0.01,
      'amp.envelope.decay': 0.3,
      'amp.envelope.sustain': 0.75,
      'amp.envelope.release': 0.2,
      'performance.portamento': 0.08,
    }),
  },
  {
    id: 'factory:cathedral-lead',
    name: 'Cathedral Lead',
    description: 'Detuned oscillators, slow envelopes, and a spacious delay.',
    patch: createPatch({
      'performance.voiceMode': 'mono',
      'performance.voiceCount': 1,
      'oscillator.1.waveform': 'sawtooth',
      'oscillator.2.waveform': 'square',
      'oscillator.2.detune': -12,
      'oscillator.3.detune': 12,
      'mixer.noise.enabled': false,
      'filter.1.cutoff': 1800,
      'filter.1.resonance': 4,
      'filter.2.type': 'bandpass',
      'filter.2.cutoff': 2600,
      'amp.envelope.attack': 0.18,
      'amp.envelope.release': 0.8,
      'lfo.1.rate': 4.5,
      'lfo.1.depth': 0.08,
      'lfo.1.target': 'oscillator.1.detune',
      'delay.enabled': true,
      'delay.time': 0.42,
      'delay.feedback': 0.38,
      'delay.mix': 0.32,
      'delay.saturation': 0.2,
    }),
  },
  {
    id: 'factory:nebula-chord',
    name: 'Nebula Chord',
    description: 'An eight-voice pad with slow envelopes and wide delay.',
    patch: createPatch({
      'performance.voiceMode': 'poly',
      'performance.voiceCount': 8,
      'oscillator.1.waveform': 'sawtooth',
      'oscillator.1.detune': -9,
      'oscillator.2.waveform': 'triangle',
      'oscillator.2.detune': 9,
      'oscillator.3.waveform': 'square',
      'oscillator.3.octave': 1,
      'mixer.oscillator.3.level': 0.25,
      'mixer.noise.enabled': false,
      'filter.1.cutoff': 1500,
      'filter.1.resonance': 3,
      'filter.2.type': 'highpass',
      'filter.2.cutoff': 280,
      'amp.envelope.attack': 0.35,
      'amp.envelope.decay': 0.8,
      'amp.envelope.sustain': 0.72,
      'amp.envelope.release': 1.4,
      'lfo.1.rate': 0.4,
      'lfo.1.depth': 0.05,
      'lfo.1.target': 'oscillator.1.detune',
      'delay.enabled': true,
      'delay.time': 0.55,
      'delay.feedback': 0.42,
      'delay.mix': 0.38,
      'delay.saturation': 0.12,
    }),
  },
  {
    id: 'factory:storm-noise',
    name: 'Storm Noise',
    description: 'Brown noise shaped into a short resonant percussion voice.',
    patch: createPatch({
      'performance.voiceMode': 'poly',
      'performance.voiceCount': 6,
      'mixer.oscillator.1.enabled': false,
      'mixer.oscillator.2.enabled': false,
      'mixer.oscillator.3.enabled': false,
      'noise.colour': 'brown',
      'mixer.noise.level': 0.7,
      'filter.1.type': 'bandpass',
      'filter.1.cutoff': 700,
      'filter.1.resonance': 9,
      'filter.1.envelope.amount': 0.4,
      'amp.envelope.attack': 0,
      'amp.envelope.decay': 0.22,
      'amp.envelope.sustain': 0,
      'amp.envelope.release': 0.15,
      'delay.enabled': true,
      'delay.time': 0.18,
      'delay.feedback': 0.25,
      'delay.mix': 0.2,
    }),
  },
]);

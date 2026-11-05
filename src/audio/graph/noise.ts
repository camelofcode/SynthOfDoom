import type { AudioBufferPort, AudioContextPort } from '../contracts';
import type { NoiseColour } from '../../synth/types';

export type RandomSource = () => number;

const BUFFER_DURATION_SECONDS = 2;

export function createNoiseBuffer(
  context: AudioContextPort,
  colour: NoiseColour,
  random: RandomSource = Math.random,
): AudioBufferPort {
  const length = Math.round(context.sampleRate * BUFFER_DURATION_SECONDS);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const output = buffer.getChannelData(0);

  let pink0 = 0;
  let pink1 = 0;
  let pink2 = 0;
  let pink3 = 0;
  let pink4 = 0;
  let pink5 = 0;
  let pink6 = 0;
  let brown = 0;

  for (let index = 0; index < output.length; index += 1) {
    const white = random() * 2 - 1;

    if (colour === 'white') {
      output[index] = white;
      continue;
    }

    if (colour === 'pink') {
      pink0 = 0.99886 * pink0 + white * 0.0555179;
      pink1 = 0.99332 * pink1 + white * 0.0750759;
      pink2 = 0.969 * pink2 + white * 0.153852;
      pink3 = 0.8665 * pink3 + white * 0.3104856;
      pink4 = 0.55 * pink4 + white * 0.5329522;
      pink5 = -0.7616 * pink5 - white * 0.016898;
      const sample =
        pink0 + pink1 + pink2 + pink3 + pink4 + pink5 + pink6 + white * 0.5362;
      pink6 = white * 0.115926;
      output[index] = sample * 0.11;
      continue;
    }

    brown = (brown + 0.02 * white) / 1.02;
    output[index] = brown * 3.5;
  }

  return buffer;
}

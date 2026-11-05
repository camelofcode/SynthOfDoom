import type { MidiMessage } from '../synth/types';

export function parseMidiMessage(data: ArrayLike<number>): MidiMessage | null {
  if (data.length < 1) return null;
  const status = data[0];
  if (status === undefined || status < 0x80) return null;
  const command = status & 0xf0;
  const channel = status & 0x0f;
  const first = data[1];
  const second = data[2];

  if (command === 0x90 && first !== undefined && second !== undefined) {
    return second === 0
      ? { type: 'note-off', channel, note: first, velocity: 0 }
      : { type: 'note-on', channel, note: first, velocity: second };
  }
  if (command === 0x80 && first !== undefined && second !== undefined) {
    return { type: 'note-off', channel, note: first, velocity: second };
  }
  if (command === 0xb0 && first !== undefined && second !== undefined) {
    return {
      type: 'control-change',
      channel,
      controller: first,
      value: second,
    };
  }
  return { type: 'unsupported', status, data: Array.from(data) };
}

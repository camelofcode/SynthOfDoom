import { describe, expect, it } from 'vitest';
import { parseMidiMessage } from './midi';

describe('MIDI decoding', () => {
  it('decodes notes, channels, velocity-zero note-off, and CC', () => {
    expect(parseMidiMessage([0x92, 60, 100])).toEqual({
      type: 'note-on',
      channel: 2,
      note: 60,
      velocity: 100,
    });
    expect(parseMidiMessage([0x90, 60, 0])).toEqual({
      type: 'note-off',
      channel: 0,
      note: 60,
      velocity: 0,
    });
    expect(parseMidiMessage([0x81, 61, 40])).toEqual({
      type: 'note-off',
      channel: 1,
      note: 61,
      velocity: 40,
    });
    expect(parseMidiMessage([0xb4, 74, 127])).toEqual({
      type: 'control-change',
      channel: 4,
      controller: 74,
      value: 127,
    });
  });

  it('rejects malformed data and preserves unsupported messages', () => {
    expect(parseMidiMessage([])).toBeNull();
    expect(parseMidiMessage([0x90, 60])).toEqual({
      type: 'unsupported',
      status: 0x90,
      data: [0x90, 60],
    });
    expect(parseMidiMessage([0xf8])).toEqual({
      type: 'unsupported',
      status: 0xf8,
      data: [0xf8],
    });
  });
});

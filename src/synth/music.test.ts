import { describe, expect, it } from 'vitest';

import {
  clampMidiNote,
  midiNoteToFrequency,
  normaliseVelocity,
  transposeMidiNote,
} from './music';

describe('music conversions', () => {
  it('converts equal-tempered MIDI notes using A4 at 440 Hz', () => {
    expect(midiNoteToFrequency(69)).toBe(440);
    expect(midiNoteToFrequency(60)).toBeCloseTo(261.6256, 4);
    expect(midiNoteToFrequency(81)).toBe(880);
  });

  it('clamps and rounds MIDI note input safely', () => {
    expect(clampMidiNote(-20)).toBe(0);
    expect(clampMidiNote(64.6)).toBe(65);
    expect(clampMidiNote(200)).toBe(127);
    expect(clampMidiNote(Number.NaN)).toBe(0);
  });

  it('transposes octaves within the legacy playable range', () => {
    expect(transposeMidiNote(60, 1)).toBe(72);
    expect(transposeMidiNote(12, -2)).toBe(1);
    expect(transposeMidiNote(120, 2)).toBe(127);
  });

  it('normalises MIDI velocity to a safe zero-to-one value', () => {
    expect(normaliseVelocity(0)).toBe(0);
    expect(normaliseVelocity(64)).toBeCloseTo(64 / 127);
    expect(normaliseVelocity(127)).toBe(1);
    expect(normaliseVelocity(200)).toBe(1);
    expect(normaliseVelocity(Number.NaN)).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';

import {
  getParameterDefinition,
  type NumericParameterDefinition,
} from './parameters';
import {
  clampNormalised,
  midiCcToNormalised,
  normalisedToMidiCc,
  normalisedToParameterValue,
  normalisedToPercentage,
  parameterValueToNormalised,
  percentageToNormalised,
} from './parameterMapping';

function numericParameter(id: Parameters<typeof getParameterDefinition>[0]) {
  const definition = getParameterDefinition(id);
  expect(definition.kind).toBe('number');
  return definition as NumericParameterDefinition;
}

describe('normalised control conversions', () => {
  it('clamps percentages and malformed values', () => {
    expect(percentageToNormalised(25)).toBe(0.25);
    expect(percentageToNormalised(150)).toBe(1);
    expect(percentageToNormalised(Number.NaN)).toBe(0);
    expect(normalisedToPercentage(-1)).toBe(0);
    expect(normalisedToPercentage(0.75)).toBe(75);
    expect(clampNormalised(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it('converts MIDI CC values at the input boundary', () => {
    expect(midiCcToNormalised(-1)).toBe(0);
    expect(midiCcToNormalised(64)).toBeCloseTo(64 / 127);
    expect(midiCcToNormalised(200)).toBe(1);
    expect(normalisedToMidiCc(0.5)).toBe(64);
    expect(normalisedToMidiCc(Number.NaN)).toBe(0);
  });
});

describe('parameter scaling', () => {
  it('maps linear controls at their boundaries and midpoint', () => {
    const mix = numericParameter('delay.mix');

    expect(normalisedToParameterValue(mix, 0)).toBe(0);
    expect(normalisedToParameterValue(mix, 0.5)).toBe(0.5);
    expect(normalisedToParameterValue(mix, 1)).toBe(1);
  });

  it('maps logarithmic frequency controls perceptually', () => {
    const cutoff = numericParameter('filter.1.cutoff');
    const midpoint = Math.sqrt(cutoff.minimum * cutoff.maximum);

    expect(normalisedToParameterValue(cutoff, 0)).toBe(60);
    expect(normalisedToParameterValue(cutoff, 0.5)).toBeCloseTo(
      Math.round(midpoint),
    );
    expect(normalisedToParameterValue(cutoff, 1)).toBe(10_000);
  });

  it('maps exponential time and bipolar controls', () => {
    const attack = numericParameter('amp.envelope.attack');
    const detune = numericParameter('oscillator.1.detune');

    expect(normalisedToParameterValue(attack, 0.5)).toBe(0.5);
    expect(normalisedToParameterValue(detune, 0)).toBe(-100);
    expect(normalisedToParameterValue(detune, 0.5)).toBe(0);
    expect(normalisedToParameterValue(detune, 1)).toBe(100);
  });

  it('round-trips representative values through inverse scaling', () => {
    const definitions = [
      numericParameter('delay.mix'),
      numericParameter('filter.1.cutoff'),
      numericParameter('amp.envelope.attack'),
      numericParameter('oscillator.1.detune'),
    ];

    for (const definition of definitions) {
      const value = normalisedToParameterValue(definition, 0.37);
      const position = parameterValueToNormalised(definition, value);
      expect(position).toBeCloseTo(0.37, 2);
    }
  });
});

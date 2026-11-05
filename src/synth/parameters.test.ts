import { describe, expect, it } from 'vitest';

import {
  MODULATION_TARGET_IDS,
  PARAMETER_IDS,
  PARAMETER_REGISTRY,
  formatParameterValue,
  getParameterDefinition,
  isParameterId,
} from './parameters';

describe('parameter registry', () => {
  it('contains one internally consistent definition for every Phase 2 ID', () => {
    expect(PARAMETER_IDS).toHaveLength(63);
    expect(new Set(PARAMETER_IDS).size).toBe(PARAMETER_IDS.length);

    for (const id of PARAMETER_IDS) {
      const definition = PARAMETER_REGISTRY[id];
      expect(definition.id).toBe(id);
      expect(definition.label).not.toBe('');
      expect(definition.group).not.toBe('');

      if (definition.kind === 'number') {
        expect(definition.minimum).toBeLessThan(definition.maximum);
        expect(definition.defaultValue).toBeGreaterThanOrEqual(
          definition.minimum,
        );
        expect(definition.defaultValue).toBeLessThanOrEqual(definition.maximum);
        expect(definition.step).toBeGreaterThan(0);
      }
    }
  });

  it('exposes only oscillator detune and filter cutoff as LFO targets', () => {
    expect(MODULATION_TARGET_IDS).toEqual([
      'oscillator.1.detune',
      'oscillator.2.detune',
      'oscillator.3.detune',
      'filter.1.cutoff',
      'filter.2.cutoff',
    ]);
  });

  it('recognises stable parameter IDs', () => {
    expect(isParameterId('filter.2.cutoff')).toBe(true);
    expect(isParameterId('Filter 2 cutoff')).toBe(false);
    expect(isParameterId('filter.3.cutoff')).toBe(false);
  });

  it('formats numeric, boolean, enum, and routing values for the UI', () => {
    expect(formatParameterValue('filter.1.cutoff', 2500)).toBe('2.5 kHz');
    expect(formatParameterValue('oscillator.1.detune', 12)).toBe('+12 ct');
    expect(formatParameterValue('delay.enabled', true)).toBe('On');
    expect(formatParameterValue('filter.1.type', 'highpass')).toBe('High-pass');
    expect(formatParameterValue('mixer.noise.filterBalance', 0)).toBe(
      '50% F1 / 50% F2',
    );
  });

  it('retains the documented release defaults independently of sustain', () => {
    expect(getParameterDefinition('amp.envelope.release').defaultValue).toBe(
      0.5,
    );
    expect(
      getParameterDefinition('filter.1.envelope.release').defaultValue,
    ).toBe(0.5);
    expect(
      getParameterDefinition('filter.2.envelope.release').defaultValue,
    ).toBe(0.5);
  });
});

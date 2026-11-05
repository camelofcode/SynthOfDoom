import { describe, expect, it } from 'vitest';

import {
  CURRENT_PATCH_VERSION,
  createDefaultPatch,
  isSynthPatch,
  migrateSynthPatch,
  validateSynthPatch,
} from './patch';

describe('SynthPatch validation and migration', () => {
  it('creates a valid, JSON-safe default patch', () => {
    const patch = createDefaultPatch();
    const roundTripped = JSON.parse(JSON.stringify(patch)) as unknown;

    expect(patch.schemaVersion).toBe(CURRENT_PATCH_VERSION);
    expect(validateSynthPatch(roundTripped)).toEqual({
      patch,
      issues: [],
      migratedFrom: null,
    });
    expect(isSynthPatch(roundTripped)).toBe(true);
  });

  it('restores malformed values and clamps unsafe numeric values', () => {
    const input = createDefaultPatch();
    const result = validateSynthPatch({
      ...input,
      parameters: {
        ...input.parameters,
        'filter.1.cutoff': 50_000,
        'delay.enabled': 'yes',
        'noise.colour': 'violet',
        'amp.envelope.release': Number.NaN,
      },
    });

    expect(result.patch.parameters['filter.1.cutoff']).toBe(10_000);
    expect(result.patch.parameters['delay.enabled']).toBe(false);
    expect(result.patch.parameters['noise.colour']).toBe('white');
    expect(result.patch.parameters['amp.envelope.release']).toBe(0.5);
    expect(result.issues.map((issue) => issue.path)).toEqual([
      'parameters.noise.colour',
      'parameters.filter.1.cutoff',
      'parameters.amp.envelope.release',
      'parameters.delay.enabled',
    ]);
    expect(isSynthPatch(result.patch)).toBe(true);
  });

  it('migrates an unversioned version-zero values object', () => {
    const result = validateSynthPatch({
      version: 0,
      values: {
        'oscillator.1.waveform': 'square',
        'filter.1.cutoff': 2200,
      },
    });

    expect(result.migratedFrom).toBe(0);
    expect(result.patch.schemaVersion).toBe(CURRENT_PATCH_VERSION);
    expect(result.patch.parameters['oscillator.1.waveform']).toBe('square');
    expect(result.patch.parameters['filter.1.cutoff']).toBe(2200);
    expect(result.patch.parameters['filter.2.cutoff']).toBe(1000);
    expect(result.issues).toContainEqual({
      path: 'parameters.filter.2.cutoff',
      reason: 'Parameter was missing; restored the default.',
    });
  });

  it('migrates version-one patches to the polyphonic defaults', () => {
    const current = createDefaultPatch();
    const parameters = { ...current.parameters } as Record<string, unknown>;
    delete parameters['performance.voiceMode'];
    delete parameters['performance.voiceCount'];

    const result = validateSynthPatch({ schemaVersion: 1, parameters });

    expect(result.migratedFrom).toBe(1);
    expect(result.issues).toEqual([]);
    expect(result.patch.parameters['performance.voiceMode']).toBe('poly');
    expect(result.patch.parameters['performance.voiceCount']).toBe(8);
  });

  it('falls back safely for unsupported or non-object patches', () => {
    const unsupported = validateSynthPatch({ schemaVersion: 99 });
    const nonObject = migrateSynthPatch('not a patch');

    expect(unsupported.issues[0]).toEqual({
      path: 'schemaVersion',
      reason: 'Unsupported patch version 99.',
    });
    expect(unsupported.patch).toEqual(createDefaultPatch());
    expect(nonObject).toEqual(createDefaultPatch());
    expect(isSynthPatch({ schemaVersion: 1, parameters: {} })).toBe(false);
  });
});

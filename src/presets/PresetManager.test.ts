import { describe, expect, it } from 'vitest';

import { SynthEngine } from '../audio/SynthEngine';
import type { StoragePort } from '../input/midiLearn';
import { createDefaultPatch } from '../synth/patch';
import { PresetManager } from './PresetManager';

class MemoryStorage implements StoragePort {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('PresetManager', () => {
  it('loads factory patches in one engine action and tracks edits', () => {
    const engine = new SynthEngine();
    const manager = new PresetManager(engine, undefined, () => 'one');

    expect(manager.getSnapshot().presets).toHaveLength(5);
    manager.select('factory:doom-bass');
    expect(engine.getPatch().parameters['filter.1.cutoff']).toBe(420);
    expect(manager.getSnapshot().dirty).toBe(false);

    engine.setParameter('filter.1.cutoff', 800);
    expect(manager.getSnapshot().dirty).toBe(true);

    manager.initialise();
    expect(engine.getPatch()).toEqual(createDefaultPatch());
    expect(manager.getSnapshot().dirty).toBe(false);
    manager.dispose();
  });

  it('saves, renames, duplicates, deletes, and restores user presets', () => {
    const engine = new SynthEngine();
    const storage = new MemoryStorage();
    let sequence = 0;
    const manager = new PresetManager(
      engine,
      storage,
      () => `id-${++sequence}`,
    );

    engine.setParameter('delay.mix', 0.27);
    const saved = manager.saveAs('  My Lead  ');
    expect(saved.name).toBe('My Lead');
    expect(manager.getSnapshot().dirty).toBe(false);

    manager.rename(saved.id, 'Renamed Lead');
    const copy = manager.duplicate(saved.id);
    expect(copy?.name).toBe('Renamed Lead copy');
    manager.delete(copy!.id);
    expect(
      manager.getSnapshot().presets.some(({ id }) => id === copy!.id),
    ).toBe(false);
    manager.select(saved.id);

    const restoredEngine = new SynthEngine();
    const restored = new PresetManager(restoredEngine, storage, () => 'unused');
    expect(restored.getSnapshot().presets).toContainEqual({
      id: saved.id,
      name: 'Renamed Lead',
      kind: 'user',
    });
    expect(restoredEngine.getPatch().parameters['delay.mix']).toBe(0.27);

    manager.dispose();
    restored.dispose();
  });

  it('round-trips exported JSON and rejects malformed imports safely', () => {
    const engine = new SynthEngine();
    const manager = new PresetManager(engine, undefined, () => 'imported');

    manager.select('factory:cathedral-lead');
    const json = manager.exportJson();
    manager.importJson(json);
    expect(manager.getSnapshot().selectedId).toBe('user:imported');
    expect(engine.getPatch().parameters['delay.enabled']).toBe(true);

    expect(() => manager.importJson('{"not":"a patch"}')).toThrow(
      'missing or invalid',
    );
    expect(manager.getSnapshot().error).toContain('missing or invalid');
    manager.dispose();
  });

  it('ignores corrupt persisted data without breaking startup', () => {
    const storage = new MemoryStorage();
    storage.setItem('synth-of-doom.presets', '{broken json');

    const manager = new PresetManager(new SynthEngine(), storage, () => 'id');
    expect(manager.getSnapshot().selectedId).toBe('factory:init');
    expect(manager.getSnapshot().error).toBe(
      'Invalid stored presets were ignored.',
    );
    manager.dispose();
  });

  it('migrates stored version-one user patches without losing them', () => {
    const storage = new MemoryStorage();
    const current = createDefaultPatch();
    const parameters = { ...current.parameters } as Record<string, unknown>;
    delete parameters['performance.voiceMode'];
    delete parameters['performance.voiceCount'];
    storage.setItem(
      'synth-of-doom.presets',
      JSON.stringify({
        version: 1,
        selectedId: 'user:legacy',
        userPresets: [
          {
            id: 'user:legacy',
            name: 'Legacy patch',
            patch: { schemaVersion: 1, parameters },
          },
        ],
      }),
    );

    const engine = new SynthEngine();
    const manager = new PresetManager(engine, storage, () => 'id');

    expect(manager.getSnapshot().selectedId).toBe('user:legacy');
    expect(engine.getPatch().schemaVersion).toBe(2);
    expect(engine.getPatch().parameters['performance.voiceMode']).toBe('poly');
    expect(engine.getPatch().parameters['performance.voiceCount']).toBe(8);
    manager.dispose();
  });
});

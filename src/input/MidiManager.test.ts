import { describe, expect, it, vi } from 'vitest';
import { SynthEngine } from '../audio/SynthEngine';
import { FakeAudioContext } from '../test/fakeAudioContext';
import { MidiLearn } from './midiLearn';
import { MidiManager } from './MidiManager';
import { NoteRouter } from './NoteRouter';

describe('MidiManager', () => {
  it('enumerates inputs, routes notes, applies learned CC, and releases on selection changes', async () => {
    const context = new FakeAudioContext();
    const engine = new SynthEngine({
      createContext: () => context,
      random: () => 0.5,
    });
    await engine.start();
    const router = new NoteRouter(engine);
    const learn = new MidiLearn();
    const input = {
      id: 'device:one',
      name: 'Test Keys',
      state: 'connected' as const,
      onmidimessage: null as ((event: { data: Uint8Array }) => void) | null,
    };
    const access = {
      inputs: new Map([[input.id, input]]),
      onstatechange: null as (() => void) | null,
    };
    const manager = new MidiManager(router, engine, learn, async () => access);

    await manager.request();
    expect(manager.getSnapshot().inputs).toEqual([
      { id: 'device:one', name: 'Test Keys' },
    ]);
    input.onmidimessage?.({ data: new Uint8Array([0x90, 60, 100]) });
    expect(router.getSnapshot().activeNotes).toEqual([60]);

    learn.begin('filter.1.cutoff');
    input.onmidimessage?.({ data: new Uint8Array([0xb0, 74, 127]) });
    expect(engine.getPatch().parameters['filter.1.cutoff']).toBe(10_000);

    manager.selectInput('another-device');
    expect(router.getSnapshot().activeNotes).toEqual([]);
    expect(input.onmidimessage).toBeNull();
    manager.dispose();
  });

  it('reports unsupported and denied access without breaking other input', async () => {
    const engine = new SynthEngine({
      createContext: () => new FakeAudioContext(),
    });
    const router = new NoteRouter(engine);
    const unsupported = new MidiManager(router, engine, new MidiLearn(), null);
    await unsupported.request();
    expect(unsupported.getSnapshot().status).toBe('unsupported');

    const denied = new MidiManager(
      router,
      engine,
      new MidiLearn(),
      vi.fn().mockRejectedValue(new DOMException('Denied', 'NotAllowedError')),
    );
    await denied.request();
    expect(denied.getSnapshot().status).toBe('denied');
  });
});

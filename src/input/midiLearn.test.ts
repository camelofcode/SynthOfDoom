import { describe, expect, it } from 'vitest';
import { MidiLearn, type StoragePort } from './midiLearn';

class MemoryStorage implements StoragePort {
  value: string | null = null;
  getItem(): string | null {
    return this.value;
  }
  setItem(_key: string, value: string): void {
    this.value = value;
  }
}

describe('MIDI learn', () => {
  it('binds the next CC, scales values, and persists mappings', () => {
    const storage = new MemoryStorage();
    const learn = new MidiLearn(storage);
    learn.begin('filter.1.cutoff');
    const change = learn.receive(74, 127);
    expect(change).toEqual({ id: 'filter.1.cutoff', value: 10_000 });
    expect(learn.getBindings().get(74)).toBe('filter.1.cutoff');
    const restored = new MidiLearn(storage);
    expect(restored.receive(74, 0)).toEqual({
      id: 'filter.1.cutoff',
      value: 60,
    });
  });

  it('uses one-to-one collision policy and clears bindings safely', () => {
    const learn = new MidiLearn();
    learn.begin('delay.mix');
    learn.receive(10, 64);
    learn.begin('amp.envelope.attack');
    learn.receive(10, 64);
    expect(learn.getBindings().get(10)).toBe('amp.envelope.attack');
    learn.clear('amp.envelope.attack');
    expect(learn.getBindings().size).toBe(0);
  });
});

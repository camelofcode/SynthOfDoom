import { describe, expect, it, vi } from 'vitest';

import { createDefaultPatch } from '../synth/patch';
import { FakeAudioContext } from '../test/fakeAudioContext';
import { SynthEngine } from './SynthEngine';

describe('SynthEngine lifecycle', () => {
  it('creates no audio nodes before explicit start and publishes state changes', async () => {
    const context = new FakeAudioContext();
    const createContext = vi.fn(() => context);
    const engine = new SynthEngine({ createContext, random: () => 0.5 });
    const listener = vi.fn();
    engine.subscribe(listener);

    expect(createContext).not.toHaveBeenCalled();
    expect(engine.getSnapshot()).toEqual({
      status: 'idle',
      error: null,
      activeNote: null,
    });

    await engine.start();

    expect(createContext).toHaveBeenCalledOnce();
    expect(context.resumeCalls).toBe(1);
    expect(engine.getSnapshot().status).toBe('running');
    expect(listener).toHaveBeenCalled();
    expect(context.oscillators).toHaveLength(6);
    expect(context.bufferSources).toHaveLength(3);
    expect(context.filters).toHaveLength(3);
    expect(context.analysers).toHaveLength(1);
    expect(context.oscillators.every((node) => node.startCalls === 1)).toBe(
      true,
    );
    expect(context.bufferSources.every((node) => node.startCalls === 1)).toBe(
      true,
    );

    await engine.start();
    expect(createContext).toHaveBeenCalledOnce();
    expect(context.oscillators).toHaveLength(6);
    expect(context.bufferSources).toHaveLength(3);
  });

  it('surfaces interrupted, suspended, and resumed context states', async () => {
    const context = new FakeAudioContext();
    const engine = new SynthEngine({
      createContext: () => context,
      random: () => 0.5,
    });
    await engine.start();

    context.setState('interrupted');
    expect(engine.getSnapshot().status).toBe('interrupted');
    context.setState('suspended');
    expect(engine.getSnapshot().status).toBe('suspended');
    await engine.start();
    expect(engine.getSnapshot().status).toBe('running');
  });

  it('reports context creation failures and supports retry', async () => {
    const context = new FakeAudioContext();
    const createContext = vi
      .fn<() => FakeAudioContext>()
      .mockImplementationOnce(() => {
        throw new Error('Audio unavailable');
      })
      .mockReturnValue(context);
    const engine = new SynthEngine({ createContext, random: () => 0.5 });

    await expect(engine.start()).rejects.toThrow('Audio unavailable');
    expect(engine.getSnapshot()).toEqual({
      status: 'failed',
      error: 'Audio unavailable',
      activeNote: null,
    });

    await engine.start();
    expect(engine.getSnapshot().status).toBe('running');
  });

  it('disposes every running source and node idempotently', async () => {
    const context = new FakeAudioContext();
    const engine = new SynthEngine({
      createContext: () => context,
      random: () => 0.5,
    });
    await engine.start();
    await engine.dispose();
    await engine.dispose();

    expect(context.closeCalls).toBe(1);
    expect(context.oscillators.every((node) => node.stopCalls === 1)).toBe(
      true,
    );
    expect(context.bufferSources.every((node) => node.stopCalls === 1)).toBe(
      true,
    );
    expect(engine.getSnapshot().status).toBe('disposed');
    await expect(engine.start()).rejects.toThrow('disposed');
  });
});

describe('SynthEngine graph and controls', () => {
  it('plays the oscillator bank with last-note priority and envelope scheduling', async () => {
    const context = new FakeAudioContext();
    context.currentTime = 10;
    const engine = new SynthEngine({
      createContext: () => context,
      random: () => 0.5,
    });
    await engine.start();

    engine.noteOn(60, 0.8);
    expect(engine.getSnapshot().activeNote).toBe(60);
    expect(context.oscillators[0]?.frequency.value).toBeCloseTo(261.6256, 4);
    expect(context.oscillators[1]?.frequency.value).toBeCloseTo(261.6256, 4);
    expect(context.oscillators[2]?.frequency.value).toBeCloseTo(261.6256, 4);
    expect(context.gains[0]?.gain.events).toContainEqual({
      type: 'linear-ramp',
      value: 0.8,
      time: 10.5,
    });

    engine.noteOn(64, 0.6);
    expect(context.oscillators[0]?.frequency.events.at(-1)?.type).toBe(
      'target',
    );
    engine.noteOff(64);
    expect(engine.getSnapshot().activeNote).toBe(60);
    engine.noteOff(60);
    expect(engine.getSnapshot().activeNote).toBeNull();
    expect(context.gains[0]?.gain.events.at(-1)).toEqual({
      type: 'linear-ramp',
      value: 0,
      time: 10.5,
    });
  });

  it('applies typed parameters and validated patches to live nodes', async () => {
    const context = new FakeAudioContext();
    const engine = new SynthEngine({
      createContext: () => context,
      random: () => 0.5,
    });
    await engine.start();

    engine.setParameter('oscillator.1.waveform', 'square');
    engine.setParameter('oscillator.1.detune', 25);
    expect(context.oscillators[0]?.type).toBe('square');
    expect(context.oscillators[0]?.detune.value).toBe(25);

    const patch = createDefaultPatch();
    const loaded = engine.loadPatch({
      ...patch,
      parameters: {
        ...patch.parameters,
        'filter.1.cutoff': 2400,
        'delay.enabled': true,
        'delay.mix': 0.25,
      },
    });
    expect(loaded.parameters['filter.1.cutoff']).toBe(2400);
    expect(context.filters[0]?.frequency.value).toBe(2400);
    expect(context.waveShapers[0]?.curve).toHaveLength(1024);

    engine.setParameter('delay.saturation', 0);
    expect(context.waveShapers[0]?.curve?.[0]).toBe(-1);
    expect(context.waveShapers[0]?.curve?.at(-1)).toBe(1);
  });

  it('reroutes LFO modulation without duplicate target connections', async () => {
    const context = new FakeAudioContext();
    const engine = new SynthEngine({
      createContext: () => context,
      random: () => 0.5,
    });
    await engine.start();
    const firstLfoDepth = context.gains.at(-3);

    engine.setParameter('lfo.1.target', 'filter.1.cutoff');
    expect(firstLfoDepth?.connections).toEqual([context.filters[0]?.frequency]);
    engine.setParameter('lfo.1.target', 'oscillator.1.detune');
    expect(firstLfoDepth?.connections).toEqual([
      context.oscillators[0]?.detune,
    ]);
    expect(firstLfoDepth?.disconnectCalls).toBe(3);
  });

  it('uses each independent release parameter from currentTime', async () => {
    const context = new FakeAudioContext();
    context.currentTime = 20;
    const engine = new SynthEngine({
      createContext: () => context,
      random: () => 0.5,
    });
    await engine.start();
    engine.setParameter('amp.envelope.release', 1.2);
    engine.setParameter('filter.1.envelope.release', 0.3);
    engine.setParameter('filter.2.envelope.release', 0.7);
    engine.noteOn(60);
    engine.noteOff(60);

    expect(context.gains[0]?.gain.events.at(-1)).toEqual({
      type: 'linear-ramp',
      value: 0,
      time: 21.2,
    });
    expect(context.filters[0]?.frequency.events.at(-1)).toEqual({
      type: 'linear-ramp',
      value: 1000,
      time: 20.3,
    });
    expect(context.filters[1]?.frequency.events.at(-1)).toEqual({
      type: 'linear-ramp',
      value: 1000,
      time: 20.7,
    });
  });

  it('rejects note commands until audio is running', () => {
    const engine = new SynthEngine({
      createContext: () => new FakeAudioContext(),
    });
    expect(() => engine.noteOn(60)).toThrow('Start the audio engine');
    expect(() => engine.noteOff(60)).toThrow('Start the audio engine');
  });

  it('publishes one serialisable patch path for UI and MIDI changes', () => {
    const engine = new SynthEngine();
    const listener = vi.fn();
    engine.subscribePatch(listener);

    engine.setParameter('delay.mix', 0.25);
    expect(listener).toHaveBeenCalledOnce();
    expect(engine.getPatchSnapshot().parameters['delay.mix']).toBe(0.25);

    engine.loadPatch(engine.getPatchSnapshot());
    expect(listener).toHaveBeenCalledTimes(2);
  });
});

import { describe, expect, it, vi } from 'vitest';

import type { ParameterValue } from '../synth/parameters';
import { createDefaultPatch } from '../synth/patch';
import type { ParameterId } from '../synth/types';
import { FakeAudioContext } from '../test/fakeAudioContext';
import { SynthEngine } from './SynthEngine';

function createPatch(overrides: Partial<Record<ParameterId, ParameterValue>>) {
  const patch = createDefaultPatch();
  return {
    ...patch,
    parameters: { ...patch.parameters, ...overrides },
  };
}

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
    expect(context.oscillators).toHaveLength(27);
    expect(context.bufferSources).toHaveLength(3);
    expect(context.filters).toHaveLength(17);
    expect(context.analysers).toHaveLength(1);
    expect(context.oscillators.every((node) => node.startCalls === 1)).toBe(
      true,
    );
    expect(context.bufferSources.every((node) => node.startCalls === 1)).toBe(
      true,
    );

    await engine.start();
    expect(createContext).toHaveBeenCalledOnce();
    expect(context.oscillators).toHaveLength(27);
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
  it('preserves monophonic last-note priority and portamento', async () => {
    const context = new FakeAudioContext();
    context.currentTime = 10;
    const engine = new SynthEngine({
      createContext: () => context,
      random: () => 0.5,
      initialPatch: createPatch({
        'performance.voiceMode': 'mono',
        'performance.voiceCount': 1,
      }),
    });
    await engine.start();

    engine.noteOn(60, 0.8);
    expect(engine.getSnapshot().activeNote).toBe(60);
    expect(context.oscillators[0]?.frequency.value).toBeCloseTo(261.6256, 4);
    expect(context.oscillators[1]?.frequency.value).toBeCloseTo(261.6256, 4);
    expect(context.oscillators[2]?.frequency.value).toBeCloseTo(261.6256, 4);
    expect(context.gains[7]?.gain.events).toContainEqual({
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
    expect(context.gains[7]?.gain.events.at(-1)).toEqual({
      type: 'linear-ramp',
      value: 0,
      time: 10.5,
    });
  });

  it('plays overlapping notes through independent polyphonic voices', async () => {
    const context = new FakeAudioContext();
    context.currentTime = 4;
    const engine = new SynthEngine({
      createContext: () => context,
      random: () => 0.5,
    });
    await engine.start();

    engine.noteOn(60, 0.8);
    engine.noteOn(64, 0.6);

    expect(context.oscillators[0]?.frequency.value).toBeCloseTo(261.6256, 4);
    expect(context.oscillators[3]?.frequency.value).toBeCloseTo(329.6276, 4);
    expect(context.gains[7]?.gain.events).toContainEqual({
      type: 'linear-ramp',
      value: 0.8,
      time: 4.5,
    });
    expect(context.gains[20]?.gain.events).toContainEqual({
      type: 'linear-ramp',
      value: 0.6,
      time: 4.5,
    });

    engine.noteOff(60);
    expect(context.gains[7]?.gain.events.at(-1)).toEqual({
      type: 'linear-ramp',
      value: 0,
      time: 4.5,
    });
    expect(engine.getSnapshot().activeNote).toBe(64);
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
    const replacementVoiceFilters = context.filters.slice(-16);
    expect(
      replacementVoiceFilters
        .filter((_, index) => index % 2 === 0)
        .every((filter) => filter.frequency.value === 2400),
    ).toBe(true);
    expect(context.waveShapers.at(-1)?.curve).toHaveLength(1024);

    engine.setParameter('delay.saturation', 0);
    expect(context.waveShapers.at(-1)?.curve?.[0]).toBe(-1);
    expect(context.waveShapers.at(-1)?.curve?.at(-1)).toBe(1);
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
    expect(firstLfoDepth?.connections).toEqual(
      context.filters
        .slice(1)
        .filter((_, index) => index % 2 === 0)
        .map((filter) => filter.frequency),
    );
    engine.setParameter('lfo.1.target', 'oscillator.1.detune');
    expect(firstLfoDepth?.connections).toEqual(
      context.oscillators
        .slice(0, 24)
        .filter((_, index) => index % 3 === 0)
        .map((oscillator) => oscillator.detune),
    );
    expect(firstLfoDepth?.disconnectCalls).toBe(3);
  });

  it('replaces the live graph when loading a patch so no DSP state survives', async () => {
    const context = new FakeAudioContext();
    const engine = new SynthEngine({
      createContext: () => context,
      random: () => 0.5,
    });
    await engine.start();
    engine.setParameter('lfo.1.target', 'filter.1.cutoff');
    engine.setParameter('delay.enabled', true);
    engine.setParameter('delay.feedback', 0.8);
    engine.noteOn(60);

    const previousAnalyser = engine.getAnalyser();
    const previousSources = [...context.oscillators, ...context.bufferSources];

    engine.loadPatch(createDefaultPatch());

    expect(engine.getAnalyser()).not.toBe(previousAnalyser);
    expect(previousSources.every((source) => source.stopCalls === 1)).toBe(
      true,
    );
    expect(context.gains.at(-3)?.connections).toEqual([]);
    expect(engine.getSnapshot().activeNote).toBe(60);
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

    expect(context.gains[7]?.gain.events.at(-1)).toEqual({
      type: 'linear-ramp',
      value: 0,
      time: 21.2,
    });
    expect(context.filters[1]?.frequency.events.at(-1)).toEqual({
      type: 'linear-ramp',
      value: 1000,
      time: 20.3,
    });
    expect(context.filters[2]?.frequency.events.at(-1)).toEqual({
      type: 'linear-ramp',
      value: 1000,
      time: 20.7,
    });
  });

  it('steals the oldest active voice with a short fade', async () => {
    const context = new FakeAudioContext();
    context.currentTime = 8;
    const engine = new SynthEngine({
      createContext: () => context,
      random: () => 0.5,
      initialPatch: createPatch({ 'performance.voiceCount': 2 }),
    });
    await engine.start();
    engine.noteOn(60);
    engine.noteOn(62);
    engine.noteOn(64);

    expect(context.oscillators[0]?.frequency.events).toContainEqual({
      type: 'set',
      value: expect.closeTo(329.6276, 4),
      time: 8.005,
    });
    expect(context.gains[7]?.gain.events).toContainEqual({
      type: 'linear-ramp',
      value: 0,
      time: 8.005,
    });
  });

  it('applies held-note patch changes to every voice and switches mode cleanly', async () => {
    const context = new FakeAudioContext();
    const engine = new SynthEngine({
      createContext: () => context,
      random: () => 0.5,
      initialPatch: createPatch({ 'performance.voiceCount': 2 }),
    });
    await engine.start();
    engine.noteOn(60);
    engine.noteOn(64);

    engine.setParameter('oscillator.1.detune', 17);
    expect(
      context.oscillators
        .slice(0, 6)
        .filter((_, index) => index % 3 === 0)
        .every((oscillator) => oscillator.detune.value === 17),
    ).toBe(true);

    const previousSources = [...context.oscillators, ...context.bufferSources];
    engine.setParameter('performance.voiceMode', 'mono');
    expect(previousSources.every((source) => source.stopCalls === 1)).toBe(
      true,
    );
    expect(context.oscillators.at(-6)?.frequency.value).toBeCloseTo(
      329.6276,
      4,
    );
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

  it('treats one voice as mono and higher counts as poly atomically', () => {
    const engine = new SynthEngine();
    const listener = vi.fn();
    engine.subscribePatch(listener);

    engine.setParameter('performance.voiceCount', 1);
    expect(engine.getPatchSnapshot().parameters['performance.voiceMode']).toBe(
      'mono',
    );
    expect(engine.getPatchSnapshot().parameters['performance.voiceCount']).toBe(
      1,
    );
    expect(listener).toHaveBeenCalledOnce();

    engine.setParameter('performance.voiceCount', 4);
    expect(engine.getPatchSnapshot().parameters['performance.voiceMode']).toBe(
      'poly',
    );
    expect(engine.getPatchSnapshot().parameters['performance.voiceCount']).toBe(
      4,
    );
    expect(listener).toHaveBeenCalledTimes(2);

    engine.loadPatch(
      createPatch({
        'performance.voiceMode': 'mono',
        'performance.voiceCount': 8,
      }),
    );
    expect(engine.getPatchSnapshot().parameters['performance.voiceCount']).toBe(
      1,
    );
  });
});

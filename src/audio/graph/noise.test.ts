import { describe, expect, it } from 'vitest';

import { FakeAudioContext } from '../../test/fakeAudioContext';
import { createNoiseBuffer } from './noise';

describe('noise buffers', () => {
  it('creates two-second mono buffers from an injectable random source', () => {
    const context = new FakeAudioContext();
    const buffer = createNoiseBuffer(context, 'white', () => 0.75);

    expect(buffer.length).toBe(200);
    expect(buffer.sampleRate).toBe(100);
    expect(Array.from(buffer.getChannelData(0).slice(0, 3))).toEqual([
      0.5, 0.5, 0.5,
    ]);
  });

  it('generates finite pink and brown samples deterministically', () => {
    const context = new FakeAudioContext();
    const values = [0.1, 0.9, 0.25, 0.75];
    let cursor = 0;
    const random = () => values[cursor++ % values.length] ?? 0.5;

    for (const colour of ['pink', 'brown'] as const) {
      cursor = 0;
      const samples = createNoiseBuffer(context, colour, random).getChannelData(
        0,
      );
      expect(samples.every(Number.isFinite)).toBe(true);
      expect(samples.some((sample) => sample !== 0)).toBe(true);
    }
  });
});

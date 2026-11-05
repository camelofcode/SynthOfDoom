import { describe, expect, it } from 'vitest';

import { VoiceAllocator } from './VoiceAllocator';

describe('VoiceAllocator', () => {
  it('uses idle voices before the oldest released and oldest active voices', () => {
    const allocator = new VoiceAllocator(3);

    expect(allocator.allocate(60).index).toBe(0);
    expect(allocator.allocate(62).index).toBe(1);
    expect(allocator.allocate(64).index).toBe(2);

    expect(allocator.release(62)).toBe(1);
    expect(allocator.allocate(65)).toMatchObject({
      index: 1,
      previousNote: 62,
      stolen: true,
    });

    expect(allocator.allocate(67)).toMatchObject({
      index: 0,
      previousNote: 60,
      stolen: true,
    });
  });

  it('reuses the oldest released voice deterministically', () => {
    const allocator = new VoiceAllocator(2);
    allocator.allocate(60);
    allocator.allocate(62);
    allocator.release(62);
    allocator.release(60);

    expect(allocator.allocate(64).index).toBe(1);
    expect(allocator.allocate(65).index).toBe(0);
  });

  it('retriggers a repeated note without consuming another voice', () => {
    const allocator = new VoiceAllocator(2);
    allocator.allocate(60);

    expect(allocator.allocate(60)).toEqual({
      index: 0,
      previousNote: 60,
      stolen: false,
      retriggered: true,
    });
    expect(allocator.getSlots()[1]?.status).toBe('idle');
  });

  it('releases all active voices and rejects invalid capacities', () => {
    expect(() => new VoiceAllocator(0)).toThrow('positive integer');
    const allocator = new VoiceAllocator(2);
    allocator.allocate(60);
    allocator.allocate(64);

    expect(allocator.releaseAll()).toEqual([0, 1]);
    expect(allocator.getSlots().map(({ status }) => status)).toEqual([
      'released',
      'released',
    ]);
  });
});

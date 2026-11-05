import { describe, expect, it } from 'vitest';

import { FakeAudioParam } from '../../test/fakeAudioContext';
import { scheduleAttackDecay, scheduleRelease } from './adsr';

describe('ADSR scheduling', () => {
  it('holds the current value and schedules attack/decay from currentTime', () => {
    const parameter = new FakeAudioParam(0.25);

    scheduleAttackDecay(
      parameter,
      { attack: 0.1, decay: 0.2, peak: 1, sustain: 0.6 },
      12,
    );

    expect(parameter.events).toEqual([
      { type: 'hold', time: 12 },
      { type: 'linear-ramp', value: 1, time: 12.1 },
      { type: 'linear-ramp', value: 0.6, time: 12.299999999999999 },
    ]);
  });

  it('uses a short safe ramp for zero attack and an immediate zero decay', () => {
    const parameter = new FakeAudioParam(0);

    scheduleAttackDecay(
      parameter,
      { attack: 0, decay: 0, peak: 1, sustain: 0.5 },
      4,
    );

    expect(parameter.events).toEqual([
      { type: 'hold', time: 4 },
      { type: 'linear-ramp', value: 1, time: 4.005 },
      { type: 'set', value: 0.5, time: 4.005 },
    ]);
  });

  it('schedules release from currentTime and handles zero release', () => {
    const parameter = new FakeAudioParam(0.7);
    scheduleRelease(parameter, 0, 0.5, 8);
    scheduleRelease(parameter, 1000, 0, 9);

    expect(parameter.events).toEqual([
      { type: 'hold', time: 8 },
      { type: 'linear-ramp', value: 0, time: 8.5 },
      { type: 'hold', time: 9 },
      { type: 'set', value: 1000, time: 9 },
    ]);
  });
});

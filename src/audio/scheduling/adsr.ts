import type { AudioParamPort } from '../contracts';

const MINIMUM_RAMP_TIME = 0.005;

export interface AdsrSchedule {
  readonly attack: number;
  readonly decay: number;
  readonly peak: number;
  readonly sustain: number;
}

function safeTime(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function holdCurrentValue(parameter: AudioParamPort, now: number): void {
  if (parameter.cancelAndHoldAtTime) {
    parameter.cancelAndHoldAtTime(now);
    return;
  }

  const currentValue = parameter.value;
  parameter.cancelScheduledValues(now);
  parameter.setValueAtTime(currentValue, now);
}

export function scheduleAttackDecay(
  parameter: AudioParamPort,
  schedule: AdsrSchedule,
  now: number,
): void {
  holdCurrentValue(parameter, now);

  const attackEnd =
    now + Math.max(MINIMUM_RAMP_TIME, safeTime(schedule.attack));
  parameter.linearRampToValueAtTime(schedule.peak, attackEnd);

  const decay = safeTime(schedule.decay);
  if (decay === 0) {
    parameter.setValueAtTime(schedule.sustain, attackEnd);
  } else {
    parameter.linearRampToValueAtTime(schedule.sustain, attackEnd + decay);
  }
}

export function scheduleRelease(
  parameter: AudioParamPort,
  target: number,
  release: number,
  now: number,
): void {
  holdCurrentValue(parameter, now);
  const duration = safeTime(release);

  if (duration === 0) {
    parameter.setValueAtTime(target, now);
    return;
  }

  parameter.linearRampToValueAtTime(target, now + duration);
}

export function setAudioParam(
  parameter: AudioParamPort,
  value: number,
  now: number,
): void {
  parameter.cancelScheduledValues(now);
  parameter.setValueAtTime(value, now);
}

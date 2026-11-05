import type { NumericParameterDefinition } from './parameters';

function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function clampNormalised(value: number): number {
  return Math.min(1, Math.max(0, finiteOrZero(value)));
}

export function percentageToNormalised(percentage: number): number {
  return clampNormalised(finiteOrZero(percentage) / 100);
}

export function normalisedToPercentage(normalised: number): number {
  return clampNormalised(normalised) * 100;
}

export function midiCcToNormalised(value: number): number {
  const midiValue = Math.round(finiteOrZero(value));
  return Math.min(127, Math.max(0, midiValue)) / 127;
}

export function normalisedToMidiCc(normalised: number): number {
  return Math.round(clampNormalised(normalised) * 127);
}

function applyStep(
  value: number,
  definition: NumericParameterDefinition,
): number {
  const steps = Math.round((value - definition.minimum) / definition.step);
  const stepped = definition.minimum + steps * definition.step;
  const clamped = Math.min(
    definition.maximum,
    Math.max(definition.minimum, stepped),
  );

  return Number(clamped.toFixed(12));
}

export function normalisedToParameterValue(
  definition: NumericParameterDefinition,
  normalised: number,
): number {
  const position = clampNormalised(normalised);
  const { minimum, maximum, scale } = definition;
  let value: number;

  switch (scale.kind) {
    case 'linear':
      value = minimum + (maximum - minimum) * position;
      break;
    case 'logarithmic':
      if (minimum <= 0 || maximum <= 0) {
        throw new RangeError('Logarithmic parameters require positive bounds.');
      }
      value = minimum * (maximum / minimum) ** position;
      break;
    case 'exponential':
      value = minimum + (maximum - minimum) * position ** scale.exponent;
      break;
    case 'bipolar':
      value =
        position <= 0.5
          ? minimum + (0 - minimum) * position * 2
          : maximum * (position - 0.5) * 2;
      break;
  }

  return applyStep(value, definition);
}

export function parameterValueToNormalised(
  definition: NumericParameterDefinition,
  value: number,
): number {
  const safeValue = Math.min(
    definition.maximum,
    Math.max(definition.minimum, finiteOrZero(value)),
  );
  const { minimum, maximum, scale } = definition;

  switch (scale.kind) {
    case 'linear':
      return (safeValue - minimum) / (maximum - minimum);
    case 'logarithmic':
      if (minimum <= 0 || maximum <= 0) {
        throw new RangeError('Logarithmic parameters require positive bounds.');
      }
      return Math.log(safeValue / minimum) / Math.log(maximum / minimum);
    case 'exponential':
      return (
        ((safeValue - minimum) / (maximum - minimum)) ** (1 / scale.exponent)
      );
    case 'bipolar':
      return safeValue <= 0
        ? ((safeValue - minimum) / (0 - minimum)) * 0.5
        : 0.5 + (safeValue / maximum) * 0.5;
  }
}

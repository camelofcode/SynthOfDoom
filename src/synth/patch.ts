import {
  PARAMETER_IDS,
  PARAMETER_REGISTRY,
  type EnumParameterDefinition,
  type ParameterDefinition,
  type ParameterValue,
  type ParameterValues,
} from './parameters';
import type { ParameterId } from './types';

export const CURRENT_PATCH_VERSION = 2 as const;

export interface SynthPatch {
  readonly schemaVersion: typeof CURRENT_PATCH_VERSION;
  readonly parameters: ParameterValues;
}

export interface PatchValidationIssue {
  readonly path: string;
  readonly reason: string;
}

export interface PatchValidationResult {
  readonly patch: SynthPatch;
  readonly issues: readonly PatchValidationIssue[];
  readonly migratedFrom: number | null;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneDefaultValues(): ParameterValues {
  const values = {} as Record<ParameterId, ParameterValue>;

  for (const id of PARAMETER_IDS) {
    values[id] = PARAMETER_REGISTRY[id].defaultValue;
  }

  return values as ParameterValues;
}

export function createDefaultPatch(): SynthPatch {
  return {
    schemaVersion: CURRENT_PATCH_VERSION,
    parameters: cloneDefaultValues(),
  };
}

function roundToStep(value: number, minimum: number, step: number): number {
  const steps = Math.round((value - minimum) / step);
  return Number((minimum + steps * step).toFixed(12));
}

function sanitiseParameterValue(
  definition: ParameterDefinition,
  value: unknown,
): { value: ParameterValue; reason: string | null } {
  if (definition.kind === 'number') {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return {
        value: definition.defaultValue,
        reason: 'Expected a finite number; restored the default.',
      };
    }

    const clamped = Math.min(
      definition.maximum,
      Math.max(definition.minimum, value),
    );
    const stepped = Math.min(
      definition.maximum,
      Math.max(
        definition.minimum,
        roundToStep(clamped, definition.minimum, definition.step),
      ),
    );

    return {
      value: stepped,
      reason:
        stepped === value
          ? null
          : 'Value was clamped or rounded to the supported range.',
    };
  }

  if (definition.kind === 'boolean') {
    return typeof value === 'boolean'
      ? { value, reason: null }
      : {
          value: definition.defaultValue,
          reason: 'Expected a boolean; restored the default.',
        };
  }

  const enumDefinition = definition as EnumParameterDefinition;
  const isOption =
    typeof value === 'string' &&
    enumDefinition.options.some((option) => option.value === value);

  return isOption
    ? { value, reason: null }
    : {
        value: enumDefinition.defaultValue,
        reason: 'Expected a supported option; restored the default.',
      };
}

function readParameterCandidate(input: unknown): {
  parameters: UnknownRecord | null;
  migratedFrom: number | null;
  rootIssue: PatchValidationIssue | null;
} {
  if (!isRecord(input)) {
    return {
      parameters: null,
      migratedFrom: null,
      rootIssue: { path: '$', reason: 'Patch must be an object.' },
    };
  }

  if (input.schemaVersion === CURRENT_PATCH_VERSION) {
    return {
      parameters: isRecord(input.parameters) ? input.parameters : null,
      migratedFrom: null,
      rootIssue: isRecord(input.parameters)
        ? null
        : { path: 'parameters', reason: 'Parameters must be an object.' },
    };
  }

  if (input.schemaVersion === 1) {
    const versionOneParameters = isRecord(input.parameters)
      ? input.parameters
      : null;
    return {
      parameters: versionOneParameters
        ? {
            ...versionOneParameters,
            'performance.voiceMode': 'poly',
            'performance.voiceCount': 8,
          }
        : null,
      migratedFrom: 1,
      rootIssue: versionOneParameters
        ? null
        : { path: 'parameters', reason: 'Parameters must be an object.' },
    };
  }

  const legacyVersion = input.schemaVersion ?? input.version;
  if (legacyVersion === 0 || legacyVersion === undefined) {
    const legacyValues = isRecord(input.values)
      ? input.values
      : isRecord(input.parameters)
        ? input.parameters
        : null;

    return {
      parameters: legacyValues,
      migratedFrom: 0,
      rootIssue: legacyValues
        ? null
        : {
            path: '$',
            reason: 'Legacy patch has no values or parameters object.',
          },
    };
  }

  return {
    parameters: null,
    migratedFrom: null,
    rootIssue: {
      path: 'schemaVersion',
      reason: `Unsupported patch version ${String(legacyVersion)}.`,
    },
  };
}

export function validateSynthPatch(input: unknown): PatchValidationResult {
  const source = readParameterCandidate(input);
  const values = {} as Record<ParameterId, ParameterValue>;
  const issues: PatchValidationIssue[] = [];

  if (source.rootIssue) {
    issues.push(source.rootIssue);
  }

  for (const id of PARAMETER_IDS) {
    const definition = PARAMETER_REGISTRY[id] as ParameterDefinition;

    if (!source.parameters || !Object.hasOwn(source.parameters, id)) {
      values[id] = definition.defaultValue;
      issues.push({
        path: `parameters.${id}`,
        reason: 'Parameter was missing; restored the default.',
      });
      continue;
    }

    const result = sanitiseParameterValue(definition, source.parameters[id]);
    values[id] = result.value;

    if (result.reason) {
      issues.push({ path: `parameters.${id}`, reason: result.reason });
    }
  }

  return {
    patch: {
      schemaVersion: CURRENT_PATCH_VERSION,
      parameters: values as ParameterValues,
    },
    issues,
    migratedFrom: source.migratedFrom,
  };
}

export function migrateSynthPatch(input: unknown): SynthPatch {
  return validateSynthPatch(input).patch;
}

export function isSynthPatch(input: unknown): input is SynthPatch {
  if (!isRecord(input) || input.schemaVersion !== CURRENT_PATCH_VERSION) {
    return false;
  }

  return validateSynthPatch(input).issues.length === 0;
}

import { PARAMETER_REGISTRY, type ParameterValue } from '../synth/parameters';
import {
  normalisedToParameterValue,
  midiCcToNormalised,
} from '../synth/parameterMapping';
import type { ParameterId } from '../synth/types';

const STORAGE_KEY = 'synth-of-doom.midi-mappings';
const VERSION = 1;

export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface MidiLearnSnapshot {
  readonly learning: ParameterId | null;
  readonly bindings: readonly {
    controller: number;
    parameterId: ParameterId;
  }[];
}

export class MidiLearn {
  private readonly bindings = new Map<number, ParameterId>();
  private readonly listeners = new Set<() => void>();
  private learning: ParameterId | null = null;
  private snapshot: MidiLearnSnapshot = { learning: null, bindings: [] };

  constructor(private readonly storage?: StoragePort) {
    this.restore();
    this.refreshSnapshot();
  }

  begin(parameterId: ParameterId): void {
    if (!PARAMETER_REGISTRY[parameterId].midiLearnable) return;
    this.learning = parameterId;
    this.emit();
  }

  cancel(): void {
    this.learning = null;
    this.emit();
  }

  receive(
    controller: number,
    value: number,
  ): { id: ParameterId; value: ParameterValue } | null {
    if (this.learning) {
      for (const [cc, id] of this.bindings) {
        if (id === this.learning || cc === controller) this.bindings.delete(cc);
      }
      this.bindings.set(controller, this.learning);
      this.learning = null;
      this.persist();
      this.emit();
    }
    const id = this.bindings.get(controller);
    if (!id) return null;
    const definition = PARAMETER_REGISTRY[id];
    const normalised = midiCcToNormalised(value);
    if (definition.kind === 'number') {
      return { id, value: normalisedToParameterValue(definition, normalised) };
    }
    if (definition.kind === 'boolean') return { id, value: normalised >= 0.5 };
    const index = Math.min(
      definition.options.length - 1,
      Math.floor(normalised * definition.options.length),
    );
    return {
      id,
      value: definition.options[index]?.value ?? definition.defaultValue,
    };
  }

  clear(parameterId?: ParameterId): void {
    if (!parameterId) this.bindings.clear();
    else
      for (const [cc, id] of this.bindings)
        if (id === parameterId) this.bindings.delete(cc);
    this.persist();
    this.emit();
  }

  getBindings(): ReadonlyMap<number, ParameterId> {
    return this.bindings;
  }

  getSnapshot = () => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emit(): void {
    this.refreshSnapshot();
    for (const listener of this.listeners) listener();
  }

  private refreshSnapshot(): void {
    this.snapshot = {
      learning: this.learning,
      bindings: [...this.bindings.entries()].map(
        ([controller, parameterId]) => ({ controller, parameterId }),
      ),
    };
  }

  private persist(): void {
    this.storage?.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: VERSION,
        bindings: Object.fromEntries(this.bindings),
      }),
    );
  }

  private restore(): void {
    try {
      const raw = this.storage?.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        version?: unknown;
        bindings?: unknown;
      };
      if (
        parsed.version !== VERSION ||
        typeof parsed.bindings !== 'object' ||
        !parsed.bindings
      )
        return;
      for (const [cc, id] of Object.entries(parsed.bindings)) {
        const controller = Number(cc);
        if (
          Number.isInteger(controller) &&
          controller >= 0 &&
          controller <= 127 &&
          typeof id === 'string' &&
          Object.hasOwn(PARAMETER_REGISTRY, id)
        ) {
          this.bindings.set(controller, id as ParameterId);
        }
      }
    } catch {
      this.bindings.clear();
    }
  }
}

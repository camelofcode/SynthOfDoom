import type { SynthEngine } from '../audio/SynthEngine';
import { FACTORY_PRESETS, type FactoryPreset } from '../synth/factoryPresets';
import {
  isSynthPatch,
  validateSynthPatch,
  type SynthPatch,
} from '../synth/patch';
import type { StoragePort } from '../input/midiLearn';

const STORAGE_KEY = 'synth-of-doom.presets';
const STORAGE_VERSION = 1;
const EXPORT_FORMAT = 'synth-of-doom-preset';

export interface UserPreset {
  readonly id: string;
  readonly name: string;
  readonly patch: SynthPatch;
}

export interface PresetSummary {
  readonly id: string;
  readonly name: string;
  readonly kind: 'factory' | 'user';
}

export interface PresetSnapshot {
  readonly presets: readonly PresetSummary[];
  readonly selectedId: string;
  readonly dirty: boolean;
  readonly error: string | null;
}

type Listener = () => void;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function clonePatch(patch: SynthPatch): SynthPatch {
  return validateSynthPatch(JSON.parse(JSON.stringify(patch))).patch;
}

export class PresetManager {
  private readonly listeners = new Set<Listener>();
  private readonly factoryById = new Map<string, FactoryPreset>(
    FACTORY_PRESETS.map((preset) => [preset.id, preset]),
  );
  private userPresets: UserPreset[] = [];
  private selectedId = 'factory:init';
  private dirty = false;
  private error: string | null = null;
  private applying = false;
  private snapshot!: PresetSnapshot;
  private readonly unsubscribePatch: () => void;

  constructor(
    private readonly engine: SynthEngine,
    private readonly storage?: StoragePort,
    private readonly createId: () => string = () => crypto.randomUUID(),
  ) {
    this.restore();
    const selected =
      this.findPatch(this.selectedId) ?? FACTORY_PRESETS[0]!.patch;
    this.applying = true;
    this.engine.loadPatch(selected);
    this.applying = false;
    this.unsubscribePatch = this.engine.subscribePatch(() => {
      if (!this.applying) {
        this.dirty = true;
        this.publish();
      }
    });
    this.refreshSnapshot();
  }

  getSnapshot = (): PresetSnapshot => this.snapshot;
  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  select(id: string): void {
    const patch = this.findPatch(id);
    if (!patch) return;
    this.selectedId = id;
    this.apply(patch);
    this.persist();
  }

  initialise(): void {
    this.select('factory:init');
  }

  saveAs(name: string): UserPreset {
    const preset: UserPreset = {
      id: `user:${this.createId()}`,
      name: this.normaliseName(name),
      patch: clonePatch(this.engine.getPatch()),
    };
    this.userPresets = [...this.userPresets, preset];
    this.selectedId = preset.id;
    this.dirty = false;
    this.error = null;
    this.persist();
    this.publish();
    return preset;
  }

  rename(id: string, name: string): void {
    this.userPresets = this.userPresets.map((preset) =>
      preset.id === id ? { ...preset, name: this.normaliseName(name) } : preset,
    );
    this.persist();
    this.publish();
  }

  duplicate(id: string): UserPreset | null {
    const source = this.findPreset(id);
    if (!source) return null;
    return this.saveAs(`${source.name} copy`);
  }

  delete(id: string): void {
    if (!id.startsWith('user:')) return;
    this.userPresets = this.userPresets.filter((preset) => preset.id !== id);
    if (this.selectedId === id) {
      this.selectedId = 'factory:init';
      this.apply(FACTORY_PRESETS[0]!.patch);
    }
    this.persist();
    this.publish();
  }

  importJson(json: string): UserPreset {
    try {
      const parsed: unknown = JSON.parse(json);
      if (!isRecord(parsed))
        throw new Error('Preset file must contain an object.');
      const candidate = parsed.format === EXPORT_FORMAT ? parsed.patch : parsed;
      const name =
        parsed.format === EXPORT_FORMAT && typeof parsed.name === 'string'
          ? parsed.name
          : 'Imported patch';
      if (!isSynthPatch(candidate)) {
        const validation = validateSynthPatch(candidate);
        if (validation.issues.length > 0) {
          throw new Error(
            'Preset contains missing or invalid parameter values.',
          );
        }
      }
      const preset = this.saveAs(name);
      const patch = validateSynthPatch(candidate).patch;
      this.userPresets = this.userPresets.map((item) =>
        item.id === preset.id ? { ...item, patch } : item,
      );
      this.apply(patch);
      this.persist();
      return { ...preset, patch };
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'Unable to import preset.';
      this.publish();
      throw error;
    }
  }

  exportJson(id = this.selectedId): string {
    const preset = this.findPreset(id);
    if (!preset) throw new Error('Preset was not found.');
    const patch =
      id === this.selectedId ? this.engine.getPatch() : preset.patch;
    return JSON.stringify(
      {
        format: EXPORT_FORMAT,
        version: STORAGE_VERSION,
        name: preset.name,
        patch,
      },
      null,
      2,
    );
  }

  dispose(): void {
    this.unsubscribePatch();
    this.listeners.clear();
  }

  private apply(patch: SynthPatch): void {
    this.applying = true;
    this.engine.loadPatch(clonePatch(patch));
    this.applying = false;
    this.dirty = false;
    this.error = null;
    this.publish();
  }

  private findPatch(id: string): SynthPatch | null {
    return this.findPreset(id)?.patch ?? null;
  }

  private findPreset(id: string): FactoryPreset | UserPreset | null {
    return (
      this.factoryById.get(id) ??
      this.userPresets.find((preset) => preset.id === id) ??
      null
    );
  }

  private normaliseName(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Preset name cannot be empty.');
    return trimmed.slice(0, 80);
  }

  private refreshSnapshot(): void {
    this.snapshot = {
      presets: [
        ...FACTORY_PRESETS.map(({ id, name }) => ({
          id,
          name,
          kind: 'factory' as const,
        })),
        ...this.userPresets.map(({ id, name }) => ({
          id,
          name,
          kind: 'user' as const,
        })),
      ],
      selectedId: this.selectedId,
      dirty: this.dirty,
      error: this.error,
    };
  }

  private publish(): void {
    this.refreshSnapshot();
    for (const listener of this.listeners) listener();
  }

  private persist(): void {
    try {
      this.storage?.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: STORAGE_VERSION,
          selectedId: this.selectedId,
          userPresets: this.userPresets,
        }),
      );
    } catch {
      this.error = 'Preset storage is unavailable; changes remain in this tab.';
    }
  }

  private restore(): void {
    try {
      const raw = this.storage?.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed) || parsed.version !== STORAGE_VERSION) return;
      if (Array.isArray(parsed.userPresets)) {
        this.userPresets = parsed.userPresets.flatMap((value): UserPreset[] => {
          if (
            !isRecord(value) ||
            typeof value.id !== 'string' ||
            typeof value.name !== 'string'
          )
            return [];
          const validation = validateSynthPatch(value.patch);
          if (!value.id.startsWith('user:') || validation.issues.length > 0)
            return [];
          return [
            {
              id: value.id,
              name: value.name.slice(0, 80),
              patch: clonePatch(validation.patch),
            },
          ];
        });
      }
      if (
        typeof parsed.selectedId === 'string' &&
        this.findPreset(parsed.selectedId)
      ) {
        this.selectedId = parsed.selectedId;
      }
    } catch {
      this.userPresets = [];
      this.selectedId = 'factory:init';
      this.error = 'Invalid stored presets were ignored.';
    }
  }
}

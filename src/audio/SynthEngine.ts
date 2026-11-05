import {
  EMPTY_NOTE_PRIORITY_STATE,
  pressNote,
  releaseAllNotes,
  releaseNote,
  type NotePriorityState,
} from '../synth/notePriority';
import { clampMidiNote } from '../synth/music';
import { type ParameterValues, type ParameterValue } from '../synth/parameters';
import {
  createDefaultPatch,
  validateSynthPatch,
  type SynthPatch,
} from '../synth/patch';
import type { ParameterId } from '../synth/types';
import type {
  AnalyserNodePort,
  AudioContextFactory,
  AudioContextPort,
  AudioContextRuntimeState,
} from './contracts';
import { createBrowserAudioContext } from './createAudioContext';
import { SynthGraph } from './SynthGraph';
import type { RandomSource } from './graph/noise';

export type SynthEngineStatus =
  'idle' | 'starting' | AudioContextRuntimeState | 'failed' | 'disposed';

export interface SynthEngineSnapshot {
  readonly status: SynthEngineStatus;
  readonly error: string | null;
  readonly activeNote: number | null;
}

export interface SynthEngineOptions {
  readonly createContext?: AudioContextFactory;
  readonly random?: RandomSource;
  readonly initialPatch?: unknown;
}

type Listener = () => void;

function normaliseNoteVelocity(velocity: number): number {
  if (!Number.isFinite(velocity)) return 0;
  return Math.min(1, Math.max(0, velocity));
}

function normaliseVoiceConfiguration(patch: SynthPatch): SynthPatch {
  const parameters = patch.parameters;
  const mono =
    parameters['performance.voiceMode'] === 'mono' ||
    parameters['performance.voiceCount'] === 1;
  const voiceMode = mono ? 'mono' : 'poly';
  const voiceCount = mono ? 1 : parameters['performance.voiceCount'];
  if (
    parameters['performance.voiceMode'] === voiceMode &&
    parameters['performance.voiceCount'] === voiceCount
  ) {
    return patch;
  }
  return {
    ...patch,
    parameters: {
      ...parameters,
      'performance.voiceMode': voiceMode,
      'performance.voiceCount': voiceCount,
    },
  };
}

export class SynthEngine {
  private readonly createContext: AudioContextFactory;
  private readonly random: RandomSource;
  private readonly listeners = new Set<Listener>();
  private readonly patchListeners = new Set<Listener>();
  private context: AudioContextPort | null = null;
  private graph: SynthGraph | null = null;
  private patch: SynthPatch;
  private notes: NotePriorityState = EMPTY_NOTE_PRIORITY_STATE;
  private startPromise: Promise<void> | null = null;
  private snapshot: SynthEngineSnapshot = {
    status: 'idle',
    error: null,
    activeNote: null,
  };

  constructor(options: SynthEngineOptions = {}) {
    this.createContext = options.createContext ?? createBrowserAudioContext;
    this.random = options.random ?? Math.random;
    this.patch = normaliseVoiceConfiguration(
      options.initialPatch
        ? validateSynthPatch(options.initialPatch).patch
        : createDefaultPatch(),
    );
  }

  getSnapshot = (): SynthEngineSnapshot => this.snapshot;

  getPatch(): SynthPatch {
    return this.patch;
  }

  getPatchSnapshot = (): SynthPatch => this.patch;

  subscribePatch = (listener: Listener): (() => void) => {
    this.patchListeners.add(listener);
    return () => this.patchListeners.delete(listener);
  };

  getAnalyser(): AnalyserNodePort | null {
    return this.graph?.analyser ?? null;
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private updateSnapshot(update: Partial<SynthEngineSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...update };
    for (const listener of this.listeners) listener();
  }

  async start(): Promise<void> {
    if (this.snapshot.status === 'disposed') {
      throw new Error('Cannot start a disposed SynthEngine.');
    }
    if (this.startPromise) return this.startPromise;

    this.startPromise = this.startInternal().finally(() => {
      this.startPromise = null;
    });
    return this.startPromise;
  }

  private async startInternal(): Promise<void> {
    this.updateSnapshot({ status: 'starting', error: null });

    try {
      if (!this.context || this.context.state === 'closed') {
        this.graph?.dispose();
        this.context = this.createContext();
        this.context.onstatechange = () => this.syncContextState();
        this.graph = new SynthGraph(
          this.context,
          this.patch.parameters,
          this.random,
        );
      }

      if (this.context.state !== 'running') {
        await this.context.resume();
      }
      this.syncContextState();
    } catch (error) {
      this.graph?.dispose();
      this.graph = null;
      const failedContext = this.context;
      if (failedContext) {
        failedContext.onstatechange = null;
        if (failedContext.state !== 'closed') {
          try {
            await failedContext.close();
          } catch {
            // The original startup error is the actionable failure to report.
          }
        }
      }
      this.context = null;
      const message =
        error instanceof Error ? error.message : 'Unable to start Web Audio.';
      this.updateSnapshot({ status: 'failed', error: message });
      throw error;
    }
  }

  private syncContextState(): void {
    if (!this.context || this.snapshot.status === 'disposed') return;
    this.updateSnapshot({ status: this.context.state, error: null });
  }

  noteOn(note: number, velocity = 1): void {
    const graph = this.requireRunningGraph();
    const safeNote = clampMidiNote(note);
    const hadActiveNote = this.notes.activeNote !== null;
    this.notes = pressNote(
      this.notes,
      safeNote,
      normaliseNoteVelocity(velocity),
    );
    const active = this.notes.activeNote;
    if (!active) return;
    if (this.patch.parameters['performance.voiceMode'] === 'mono') {
      graph.triggerNote(active.note, active.velocity, hadActiveNote);
    } else {
      graph.triggerNote(safeNote, normaliseNoteVelocity(velocity), false);
    }
    this.updateSnapshot({ activeNote: active.note });
  }

  noteOff(note: number): void {
    const graph = this.requireRunningGraph();
    const previousActive = this.notes.activeNote?.note ?? null;
    const safeNote = clampMidiNote(note);
    this.notes = releaseNote(this.notes, safeNote);
    const active = this.notes.activeNote;

    if (this.patch.parameters['performance.voiceMode'] === 'poly') {
      graph.releaseNote(safeNote);
      this.updateSnapshot({ activeNote: active?.note ?? null });
      return;
    }

    if (previousActive === active?.note) return;
    if (active) {
      graph.triggerNote(active.note, active.velocity, true);
    } else {
      graph.releaseNote();
    }
    this.updateSnapshot({ activeNote: active?.note ?? null });
  }

  allNotesOff(): void {
    if (!this.graph) return;
    this.notes = releaseAllNotes();
    this.graph.releaseAllNotes();
    this.updateSnapshot({ activeNote: null });
  }

  setParameter<Id extends ParameterId>(
    id: Id,
    value: ParameterValues[Id],
  ): ParameterValue {
    const result = validateSynthPatch({
      ...this.patch,
      parameters: { ...this.patch.parameters, [id]: value },
    });
    this.patch = result.patch;
    if (id === 'performance.voiceCount') {
      this.patch = {
        ...this.patch,
        parameters: {
          ...this.patch.parameters,
          'performance.voiceMode':
            this.patch.parameters['performance.voiceCount'] === 1
              ? 'mono'
              : 'poly',
        },
      };
    } else if (id === 'performance.voiceMode') {
      const voiceMode = this.patch.parameters['performance.voiceMode'];
      this.patch = {
        ...this.patch,
        parameters: {
          ...this.patch.parameters,
          'performance.voiceCount':
            voiceMode === 'mono'
              ? 1
              : this.patch.parameters['performance.voiceCount'] === 1
                ? 8
                : this.patch.parameters['performance.voiceCount'],
        },
      };
    }
    if (id === 'performance.voiceMode' || id === 'performance.voiceCount') {
      this.replaceGraph();
    } else {
      this.graph?.applyParameter(id, this.patch.parameters);
    }
    for (const listener of this.patchListeners) listener();
    return this.patch.parameters[id];
  }

  loadPatch(input: unknown): SynthPatch {
    this.patch = normaliseVoiceConfiguration(validateSynthPatch(input).patch);
    this.replaceGraph();
    for (const listener of this.patchListeners) listener();
    return this.patch;
  }

  private replaceGraph(): void {
    if (this.context && this.graph) {
      const previousGraph = this.graph;
      const replacementGraph = new SynthGraph(
        this.context,
        this.patch.parameters,
        this.random,
      );
      const activeNote = this.notes.activeNote;
      if (this.patch.parameters['performance.voiceMode'] === 'mono') {
        if (activeNote) {
          replacementGraph.triggerNote(
            activeNote.note,
            activeNote.velocity,
            false,
          );
        }
      } else {
        for (const heldNote of this.notes.heldNotes) {
          replacementGraph.triggerNote(heldNote.note, heldNote.velocity, false);
        }
      }
      this.graph = replacementGraph;
      previousGraph.dispose();
      this.updateSnapshot({ activeNote: activeNote?.note ?? null });
    }
  }

  private requireRunningGraph(): SynthGraph {
    if (!this.graph || this.snapshot.status !== 'running') {
      throw new Error('Start the audio engine before playing notes.');
    }
    return this.graph;
  }

  async dispose(): Promise<void> {
    if (this.snapshot.status === 'disposed') return;
    this.notes = releaseAllNotes();
    this.graph?.dispose();
    this.graph = null;

    const context = this.context;
    this.context = null;
    if (context) {
      context.onstatechange = null;
      if (context.state !== 'closed') await context.close();
    }

    this.updateSnapshot({ status: 'disposed', error: null, activeNote: null });
    this.listeners.clear();
    this.patchListeners.clear();
  }
}

import type { SynthEngine } from '../audio/SynthEngine';
import { normaliseVelocity } from '../synth/music';
import type { NoteRouter } from './NoteRouter';
import { parseMidiMessage } from './midi';
import type { MidiLearn } from './midiLearn';

interface MidiMessageEventPort {
  readonly data: Uint8Array;
}
interface MidiInputPort {
  readonly id: string;
  readonly name: string | null;
  readonly state: 'connected' | 'disconnected';
  onmidimessage: ((event: MidiMessageEventPort) => void) | null;
}
interface MidiAccessPort {
  readonly inputs: ReadonlyMap<string, MidiInputPort>;
  onstatechange: (() => void) | null;
}
type RequestMidiAccess = () => Promise<MidiAccessPort>;

export type MidiStatus =
  'idle' | 'requesting' | 'ready' | 'unsupported' | 'denied' | 'error';
export interface MidiSnapshot {
  readonly status: MidiStatus;
  readonly inputs: readonly { id: string; name: string }[];
  readonly selectedInputId: string;
  readonly error: string | null;
}

export function createBrowserMidiRequest(): RequestMidiAccess | null {
  const navigatorWithMidi = navigator as Navigator & {
    requestMIDIAccess?: () => Promise<MidiAccessPort>;
  };
  return navigatorWithMidi.requestMIDIAccess
    ? () =>
        navigatorWithMidi.requestMIDIAccess!() as unknown as Promise<MidiAccessPort>
    : null;
}

export class MidiManager {
  private access: MidiAccessPort | null = null;
  private readonly listeners = new Set<() => void>();
  private snapshot: MidiSnapshot = {
    status: 'idle',
    inputs: [],
    selectedInputId: 'all',
    error: null,
  };

  constructor(
    private readonly router: NoteRouter,
    private readonly engine: SynthEngine,
    private readonly learn: MidiLearn,
    private readonly requestAccess: RequestMidiAccess | null = createBrowserMidiRequest(),
  ) {}

  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  async request(): Promise<void> {
    if (!this.requestAccess) {
      this.update({
        status: 'unsupported',
        error: 'Web MIDI is not supported by this browser.',
      });
      return;
    }
    this.update({ status: 'requesting', error: null });
    try {
      this.access = await this.requestAccess();
      this.access.onstatechange = () => this.refreshInputs();
      this.refreshInputs();
    } catch (error) {
      const denied =
        error instanceof DOMException && error.name === 'NotAllowedError';
      this.update({
        status: denied ? 'denied' : 'error',
        error: denied
          ? 'MIDI permission was denied.'
          : 'Unable to access MIDI devices.',
      });
    }
  }

  selectInput(id: string): void {
    this.router.allNotesOff({ source: 'midi' });
    this.snapshot = { ...this.snapshot, selectedInputId: id };
    this.attachInputs();
    this.emit();
  }

  private refreshInputs(): void {
    const inputs = this.access
      ? [...this.access.inputs.values()].filter(
          (input) => input.state === 'connected',
        )
      : [];
    const selectedInputId =
      this.snapshot.selectedInputId === 'all' ||
      inputs.some((input) => input.id === this.snapshot.selectedInputId)
        ? this.snapshot.selectedInputId
        : 'all';
    this.snapshot = {
      ...this.snapshot,
      status: 'ready',
      inputs: inputs.map((input) => ({
        id: input.id,
        name: input.name ?? 'Unnamed MIDI input',
      })),
      selectedInputId,
      error: null,
    };
    this.attachInputs();
    this.emit();
  }

  private attachInputs(): void {
    if (!this.access) return;
    for (const input of this.access.inputs.values()) {
      const selected =
        this.snapshot.selectedInputId === 'all' ||
        this.snapshot.selectedInputId === input.id;
      input.onmidimessage = selected
        ? (event) => this.handleMessage(input.id, event.data)
        : null;
      if (!selected || input.state === 'disconnected')
        this.router.allNotesOff({ source: 'midi', sourceId: input.id });
    }
  }

  private handleMessage(inputId: string, data: Uint8Array): void {
    const message = parseMidiMessage(data);
    if (!message) return;
    const owner = { source: 'midi' as const, sourceId: inputId };
    if (message.type === 'note-on')
      this.router.noteOn(
        owner,
        message.note,
        normaliseVelocity(message.velocity),
      );
    else if (message.type === 'note-off')
      this.router.noteOff(owner, message.note);
    else if (message.type === 'control-change') {
      const change = this.learn.receive(message.controller, message.value);
      if (change) this.engine.setParameter(change.id, change.value);
    }
  }

  dispose(): void {
    this.router.allNotesOff({ source: 'midi' });
    if (this.access) {
      this.access.onstatechange = null;
      for (const input of this.access.inputs.values())
        input.onmidimessage = null;
    }
    this.listeners.clear();
  }

  private update(update: Partial<MidiSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...update };
    this.emit();
  }
  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}

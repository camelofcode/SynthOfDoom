import type { NoteInputSource } from '../synth/types';

export interface NoteTarget {
  noteOn(note: number, velocity?: number): void;
  noteOff(note: number): void;
  allNotesOff(): void;
}

export interface NoteOwner {
  readonly source: NoteInputSource;
  readonly sourceId: string;
}

export interface NoteRouterSnapshot {
  readonly activeNotes: readonly number[];
}

type Listener = () => void;

function ownerKey(owner: NoteOwner): string {
  return `${owner.source}:${owner.sourceId}`;
}

export class NoteRouter {
  private readonly owners = new Map<
    number,
    Map<string, { owner: NoteOwner; velocity: number }>
  >();
  private readonly listeners = new Set<Listener>();
  private snapshot: NoteRouterSnapshot = { activeNotes: [] };

  constructor(private readonly target: NoteTarget) {}

  getSnapshot = (): NoteRouterSnapshot => this.snapshot;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  noteOn(owner: NoteOwner, note: number, velocity = 1): void {
    const noteOwners =
      this.owners.get(note) ??
      new Map<string, { owner: NoteOwner; velocity: number }>();
    const wasHeld = noteOwners.size > 0;
    noteOwners.set(ownerKey(owner), { owner, velocity });
    this.owners.set(note, noteOwners);
    if (!wasHeld) this.target.noteOn(note, velocity);
    this.publish();
  }

  noteOff(owner: NoteOwner, note: number): void {
    const noteOwners = this.owners.get(note);
    if (!noteOwners) return;
    noteOwners.delete(ownerKey(owner));
    if (noteOwners.size === 0) {
      this.owners.delete(note);
      this.target.noteOff(note);
    }
    this.publish();
  }

  allNotesOff(owner?: Partial<NoteOwner>): void {
    if (!owner) {
      this.owners.clear();
      this.target.allNotesOff();
      this.publish();
      return;
    }

    for (const [note, noteOwners] of this.owners) {
      for (const [key, entry] of noteOwners) {
        if (
          (!owner.source || entry.owner.source === owner.source) &&
          (!owner.sourceId || entry.owner.sourceId === owner.sourceId)
        ) {
          noteOwners.delete(key);
        }
      }
      if (noteOwners.size === 0) {
        this.owners.delete(note);
        this.target.noteOff(note);
      }
    }
    this.publish();
  }

  private publish(): void {
    this.snapshot = {
      activeNotes: [...this.owners.keys()].sort((left, right) => left - right),
    };
    for (const listener of this.listeners) listener();
  }
}

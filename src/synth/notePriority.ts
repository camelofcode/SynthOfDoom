export interface HeldNote {
  readonly note: number;
  readonly velocity: number;
}

export interface NotePriorityState {
  readonly heldNotes: readonly HeldNote[];
  readonly activeNote: HeldNote | null;
}

export const EMPTY_NOTE_PRIORITY_STATE: NotePriorityState = Object.freeze({
  heldNotes: Object.freeze([]),
  activeNote: null,
});

function createState(heldNotes: readonly HeldNote[]): NotePriorityState {
  return {
    heldNotes,
    activeNote: heldNotes.at(-1) ?? null,
  };
}

export function pressNote(
  state: NotePriorityState,
  note: number,
  velocity: number,
): NotePriorityState {
  const nextNote = { note, velocity };
  const withoutDuplicate = state.heldNotes.filter(
    (heldNote) => heldNote.note !== note,
  );

  return createState([...withoutDuplicate, nextNote]);
}

export function releaseNote(
  state: NotePriorityState,
  note: number,
): NotePriorityState {
  return createState(
    state.heldNotes.filter((heldNote) => heldNote.note !== note),
  );
}

export function releaseAllNotes(): NotePriorityState {
  return EMPTY_NOTE_PRIORITY_STATE;
}

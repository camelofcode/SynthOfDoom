import { describe, expect, it } from 'vitest';

import {
  EMPTY_NOTE_PRIORITY_STATE,
  pressNote,
  releaseAllNotes,
  releaseNote,
} from './notePriority';

describe('last-note priority', () => {
  it('makes the most recently pressed held note active', () => {
    const first = pressNote(EMPTY_NOTE_PRIORITY_STATE, 60, 0.8);
    const second = pressNote(first, 64, 0.7);

    expect(second.activeNote).toEqual({ note: 64, velocity: 0.7 });
    expect(second.heldNotes).toEqual([
      { note: 60, velocity: 0.8 },
      { note: 64, velocity: 0.7 },
    ]);
  });

  it('returns to the previous held note after an out-of-order release', () => {
    const state = pressNote(
      pressNote(EMPTY_NOTE_PRIORITY_STATE, 60, 0.8),
      64,
      0.7,
    );

    expect(releaseNote(state, 64).activeNote).toEqual({
      note: 60,
      velocity: 0.8,
    });
    expect(releaseNote(state, 60).activeNote).toEqual({
      note: 64,
      velocity: 0.7,
    });
  });

  it('deduplicates repeated note-on events and updates their priority', () => {
    const state = pressNote(
      pressNote(pressNote(EMPTY_NOTE_PRIORITY_STATE, 60, 0.8), 64, 0.7),
      60,
      0.5,
    );

    expect(state.heldNotes).toEqual([
      { note: 64, velocity: 0.7 },
      { note: 60, velocity: 0.5 },
    ]);
    expect(state.activeNote).toEqual({ note: 60, velocity: 0.5 });
  });

  it('ignores unknown note-off events and can release everything', () => {
    const state = pressNote(EMPTY_NOTE_PRIORITY_STATE, 60, 1);

    expect(releaseNote(state, 72)).toEqual(state);
    expect(releaseAllNotes()).toBe(EMPTY_NOTE_PRIORITY_STATE);
  });
});

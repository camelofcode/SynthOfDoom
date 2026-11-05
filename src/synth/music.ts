export const MIDI_NOTE_MIN = 0;
export const MIDI_NOTE_MAX = 127;
export const LEGACY_TRANSPOSED_NOTE_MIN = 1;
export const A4_MIDI_NOTE = 69;
export const A4_FREQUENCY = 440;

function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

export function clampMidiNote(note: number): number {
  return Math.round(
    Math.min(
      MIDI_NOTE_MAX,
      Math.max(MIDI_NOTE_MIN, finiteOr(note, MIDI_NOTE_MIN)),
    ),
  );
}

export function transposeMidiNote(note: number, octaves: number): number {
  const transposed =
    finiteOr(note, LEGACY_TRANSPOSED_NOTE_MIN) +
    Math.round(finiteOr(octaves, 0)) * 12;

  return Math.round(
    Math.min(MIDI_NOTE_MAX, Math.max(LEGACY_TRANSPOSED_NOTE_MIN, transposed)),
  );
}

export function midiNoteToFrequency(note: number): number {
  const safeNote = clampMidiNote(note);
  return A4_FREQUENCY * 2 ** ((safeNote - A4_MIDI_NOTE) / 12);
}

export function normaliseVelocity(velocity: number): number {
  const safeVelocity = Math.round(finiteOr(velocity, 0));
  return Math.min(127, Math.max(0, safeVelocity)) / 127;
}

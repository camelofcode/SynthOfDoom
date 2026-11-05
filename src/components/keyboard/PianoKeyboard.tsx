import { noteRouter } from '../../input/inputInstance';

const KEYS = [
  [60, 'C4', false],
  [61, 'C♯4', true],
  [62, 'D4', false],
  [63, 'D♯4', true],
  [64, 'E4', false],
  [65, 'F4', false],
  [66, 'F♯4', true],
  [67, 'G4', false],
  [68, 'G♯4', true],
  [69, 'A4', false],
  [70, 'A♯4', true],
  [71, 'B4', false],
  [72, 'C5', false],
] as const;

export function PianoKeyboard({
  activeNotes,
  disabled,
}: {
  readonly activeNotes: readonly number[];
  readonly disabled: boolean;
}) {
  const release = (pointerId: number, note: number) =>
    noteRouter.noteOff(
      { source: 'pointer', sourceId: String(pointerId) },
      note,
    );
  return (
    <div className="pianoKeyboard" role="group" aria-label="Piano keyboard">
      {KEYS.map(([note, label, sharp]) => (
        <button
          key={note}
          type="button"
          className={`pianoKey ${sharp ? 'pianoKeySharp' : ''}`}
          aria-label={label}
          aria-pressed={activeNotes.includes(note)}
          disabled={disabled}
          onPointerDown={(event) => {
            noteRouter.noteOn(
              { source: 'pointer', sourceId: String(event.pointerId) },
              note,
              100 / 127,
            );
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
              // Synthetic/test pointers may not be registered as active.
            }
          }}
          onPointerUp={(event) => release(event.pointerId, note)}
          onPointerCancel={(event) => release(event.pointerId, note)}
          onPointerLeave={(event) => {
            if (event.buttons > 0) release(event.pointerId, note);
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

import { useRef, type CSSProperties } from 'react';
import { noteRouter } from '../../input/inputInstance';

const WHITE_KEYS = [
  [60, 'C4'],
  [62, 'D4'],
  [64, 'E4'],
  [65, 'F4'],
  [67, 'G4'],
  [69, 'A4'],
  [71, 'B4'],
  [72, 'C5'],
  [74, 'D5'],
  [76, 'E5'],
  [77, 'F5'],
  [79, 'G5'],
  [81, 'A5'],
  [83, 'B5'],
  [84, 'C6'],
] as const;

const BLACK_KEYS = [
  [61, 'C♯4', 1],
  [63, 'D♯4', 2],
  [66, 'F♯4', 4],
  [68, 'G♯4', 5],
  [70, 'A♯4', 6],
  [73, 'C♯5', 8],
  [75, 'D♯5', 9],
  [78, 'F♯5', 11],
  [80, 'G♯5', 12],
  [82, 'A♯5', 13],
] as const;

export function PianoKeyboard({
  activeNotes,
  audioReady,
  onRequestAudio,
}: {
  readonly activeNotes: readonly number[];
  readonly audioReady: boolean;
  readonly onRequestAudio: () => Promise<void>;
}) {
  const pendingPointers = useRef(new Map<number, number>());
  const playingPointers = useRef(new Map<number, number>());

  const play = (pointerId: number, note: number) => {
    playingPointers.current.set(pointerId, note);
    noteRouter.noteOn(
      { source: 'pointer', sourceId: String(pointerId) },
      note,
      100 / 127,
    );
  };

  const release = (pointerId: number) => {
    pendingPointers.current.delete(pointerId);
    const note = playingPointers.current.get(pointerId);
    if (note === undefined) return;
    playingPointers.current.delete(pointerId);
    noteRouter.noteOff(
      { source: 'pointer', sourceId: String(pointerId) },
      note,
    );
  };

  const startAndPlay = (pointerId: number, note: number) => {
    pendingPointers.current.set(pointerId, note);
    void onRequestAudio()
      .then(() => {
        if (pendingPointers.current.get(pointerId) !== note) return;
        pendingPointers.current.delete(pointerId);
        play(pointerId, note);
      })
      .catch(() => pendingPointers.current.delete(pointerId));
  };

  const renderKey = (
    note: number,
    label: string,
    sharp: boolean,
    position?: number,
  ) => (
    <button
      key={note}
      type="button"
      className={`pianoKey ${sharp ? 'pianoKeySharp' : ''}`}
      style={
        position === undefined
          ? undefined
          : ({ '--piano-key-position': position } as CSSProperties)
      }
      aria-label={label}
      aria-pressed={activeNotes.includes(note)}
      data-audio-locked={!audioReady || undefined}
      title={!audioReady ? 'Start audio and play this note' : undefined}
      onPointerDown={(event) => {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // Synthetic/test pointers may not be registered as active.
        }
        if (audioReady) play(event.pointerId, note);
        else startAndPlay(event.pointerId, note);
      }}
      onPointerUp={(event) => release(event.pointerId)}
      onPointerCancel={(event) => release(event.pointerId)}
      onPointerLeave={(event) => {
        if (event.buttons > 0) release(event.pointerId);
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="pianoKeyboard" role="group" aria-label="Piano keyboard">
      <div className="pianoKeyboardKeys">
        {WHITE_KEYS.map(([note, label]) => renderKey(note, label, false))}
        {BLACK_KEYS.map(([note, label, position]) =>
          renderKey(note, label, true, position),
        )}
      </div>
    </div>
  );
}

import type { NoteRouter } from './NoteRouter';

export const COMPUTER_KEY_MAP: Readonly<Record<string, number>> = Object.freeze(
  {
    KeyQ: 60,
    Digit2: 61,
    KeyW: 62,
    Digit3: 63,
    KeyE: 64,
    KeyR: 65,
    Digit5: 66,
    KeyT: 67,
    Digit6: 68,
    KeyY: 69,
    Digit7: 70,
    KeyU: 71,
    KeyI: 72,
  },
);

export interface ComputerKeyboardOptions {
  readonly window: Window;
  readonly document: Document;
  readonly router: NoteRouter;
  readonly isActive: () => boolean;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
}

export function attachComputerKeyboard({
  window,
  document,
  router,
  isActive,
}: ComputerKeyboardOptions): () => void {
  const held = new Map<string, number>();
  let octaveShift = 0;
  const owner = { source: 'computer' as const, sourceId: 'computer-keyboard' };

  const releaseAll = () => {
    held.clear();
    router.allNotesOff(owner);
  };

  const keyDown = (event: KeyboardEvent) => {
    if (event.repeat || isTypingTarget(event.target) || !isActive()) return;
    if (event.code === 'KeyZ' || event.code === 'KeyX') {
      octaveShift = Math.min(
        2,
        Math.max(-2, octaveShift + (event.code === 'KeyX' ? 1 : -1)),
      );
      event.preventDefault();
      return;
    }
    const baseNote = COMPUTER_KEY_MAP[event.code];
    if (baseNote === undefined || held.has(event.code)) return;
    const note = baseNote + octaveShift * 12;
    held.set(event.code, note);
    router.noteOn(owner, note, 100 / 127);
    event.preventDefault();
  };

  const keyUp = (event: KeyboardEvent) => {
    const note = held.get(event.code);
    if (note === undefined) return;
    held.delete(event.code);
    router.noteOff(owner, note);
    event.preventDefault();
  };

  const visibilityChange = () => {
    if (document.visibilityState === 'hidden') releaseAll();
  };

  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  window.addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', visibilityChange);

  return () => {
    releaseAll();
    window.removeEventListener('keydown', keyDown);
    window.removeEventListener('keyup', keyUp);
    window.removeEventListener('blur', releaseAll);
    document.removeEventListener('visibilitychange', visibilityChange);
  };
}

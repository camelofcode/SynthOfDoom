import { useEffect, useSyncExternalStore } from 'react';
import { noteRouter } from '../input/inputInstance';
import { attachComputerKeyboard } from '../input/computerKeyboard';

export function useNoteInput(audioRunning: boolean) {
  const snapshot = useSyncExternalStore(
    noteRouter.subscribe,
    noteRouter.getSnapshot,
    noteRouter.getSnapshot,
  );
  useEffect(
    () =>
      attachComputerKeyboard({
        window,
        document,
        router: noteRouter,
        isActive: () => audioRunning,
      }),
    [audioRunning],
  );
  return snapshot;
}

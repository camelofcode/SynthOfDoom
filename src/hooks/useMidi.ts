import { useSyncExternalStore } from 'react';
import { midiManager } from '../input/inputInstance';

export function useMidi() {
  const snapshot = useSyncExternalStore(
    midiManager.subscribe,
    midiManager.getSnapshot,
    midiManager.getSnapshot,
  );
  return {
    ...snapshot,
    request: () => midiManager.request(),
    selectInput: (id: string) => midiManager.selectInput(id),
  };
}

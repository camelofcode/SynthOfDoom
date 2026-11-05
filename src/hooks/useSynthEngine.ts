import { useSyncExternalStore } from 'react';

import { synthEngine } from '../audio/engineInstance';

export function useSynthEngine() {
  const snapshot = useSyncExternalStore(
    synthEngine.subscribe,
    synthEngine.getSnapshot,
    synthEngine.getSnapshot,
  );

  return {
    ...snapshot,
    start: () => synthEngine.start(),
  };
}

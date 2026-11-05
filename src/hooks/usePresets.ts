import { useSyncExternalStore } from 'react';
import { presetManager } from '../presets/presetInstance';

export function usePresets() {
  const snapshot = useSyncExternalStore(
    presetManager.subscribe,
    presetManager.getSnapshot,
    presetManager.getSnapshot,
  );
  return { ...snapshot, manager: presetManager };
}

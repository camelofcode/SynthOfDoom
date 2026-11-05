import { synthEngine } from '../audio/engineInstance';
import { PresetManager } from './PresetManager';

function getStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export const presetManager = new PresetManager(synthEngine, getStorage());

if (import.meta.hot) import.meta.hot.dispose(() => presetManager.dispose());

import { synthEngine } from '../audio/engineInstance';
import { MidiLearn } from './midiLearn';
import { MidiManager } from './MidiManager';
import { NoteRouter } from './NoteRouter';

export const noteRouter = new NoteRouter(synthEngine);

function getStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export const midiLearn = new MidiLearn(getStorage());
export const midiManager = new MidiManager(noteRouter, synthEngine, midiLearn);

if (import.meta.hot) import.meta.hot.dispose(() => midiManager.dispose());

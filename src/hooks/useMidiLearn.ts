import { useSyncExternalStore } from 'react';
import { midiLearn } from '../input/inputInstance';

export function useMidiLearn() {
  const snapshot = useSyncExternalStore(
    midiLearn.subscribe,
    midiLearn.getSnapshot,
    midiLearn.getSnapshot,
  );
  return {
    ...snapshot,
    begin: midiLearn.begin.bind(midiLearn),
    cancel: midiLearn.cancel.bind(midiLearn),
    clear: midiLearn.clear.bind(midiLearn),
  };
}

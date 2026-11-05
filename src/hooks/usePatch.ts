import { useSyncExternalStore } from 'react';
import { synthEngine } from '../audio/engineInstance';
import type { ParameterValues } from '../synth/parameters';
import type { ParameterId } from '../synth/types';

export function usePatch() {
  const patch = useSyncExternalStore(
    synthEngine.subscribePatch,
    synthEngine.getPatchSnapshot,
    synthEngine.getPatchSnapshot,
  );
  return {
    patch,
    setParameter: <Id extends ParameterId>(
      id: Id,
      value: ParameterValues[Id],
    ) => synthEngine.setParameter(id, value),
  };
}

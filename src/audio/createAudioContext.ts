import type { AudioContextFactory, AudioContextPort } from './contracts';

interface WebkitAudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export const createBrowserAudioContext: AudioContextFactory = () => {
  const browserWindow = globalThis.window as WebkitAudioWindow | undefined;
  const Context = globalThis.AudioContext ?? browserWindow?.webkitAudioContext;

  if (!Context) {
    throw new Error('Web Audio is not supported by this browser.');
  }

  return new Context() as unknown as AudioContextPort;
};

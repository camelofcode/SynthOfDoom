import { SynthEngine } from './SynthEngine';

export const synthEngine = new SynthEngine();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    void synthEngine.dispose();
  });
}

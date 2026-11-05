import type { SynthEngineStatus } from '../audio/SynthEngine';
import { useSynthEngine } from '../hooks/useSynthEngine';
import styles from './App.module.scss';

const plannedModules = [
  'Oscillator bank',
  'Noise generator',
  'Mixer and routing',
  'Dual filters',
  'Envelopes',
  'LFO modulation',
  'Delay and output',
  'Keyboard and MIDI',
];

const statusLabels: Record<SynthEngineStatus, string> = {
  idle: 'Ready to start',
  starting: 'Starting',
  running: 'Running',
  suspended: 'Suspended',
  interrupted: 'Interrupted',
  closed: 'Closed',
  failed: 'Start failed',
  disposed: 'Stopped',
};

export function App() {
  const audio = useSynthEngine();
  const canStart = !['starting', 'running', 'disposed'].includes(audio.status);

  const startAudio = () => {
    void audio.start().catch(() => {
      // The engine publishes an actionable failure message through its snapshot.
    });
  };

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>React · TypeScript · Web Audio</p>
          <h1>SynthOfDoom</h1>
        </div>
        <span className={styles.phaseBadge}>Phase 3 · Audio engine</span>
      </header>

      <main>
        <section className={styles.intro} aria-labelledby="foundation-title">
          <p className={styles.kicker}>Audio engine ready</p>
          <h2 id="foundation-title">The signal path is alive.</h2>
          <p>
            The complete monophonic synth graph is independent from React and
            remains silent until you explicitly start it. Unified note input and
            performance controls arrive in the next phase.
          </p>
        </section>

        <section className={styles.audioPanel} aria-labelledby="audio-title">
          <div>
            <p className={styles.kicker}>Web Audio lifecycle</p>
            <h2 id="audio-title">Audio: {statusLabels[audio.status]}</h2>
            <p className={styles.audioMessage} aria-live="polite">
              {audio.error ??
                (audio.status === 'running'
                  ? 'The engine is running and ready for note input.'
                  : 'Audio begins only after your explicit gesture.')}
            </p>
          </div>
          <button
            className={styles.startButton}
            type="button"
            onClick={startAudio}
            disabled={!canStart}
          >
            {audio.status === 'failed' ? 'Retry audio' : 'Start audio'}
          </button>
        </section>

        <section
          className={styles.moduleGrid}
          aria-label="Planned synth modules"
        >
          {plannedModules.map((moduleName, index) => (
            <article className={styles.moduleCard} key={moduleName}>
              <span className={styles.moduleNumber}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{moduleName}</h3>
              <p>Queued for a later implementation phase.</p>
            </article>
          ))}
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Audio engine ready</span>
        <span aria-hidden="true">·</span>
        <span>Unified input next</span>
      </footer>
    </div>
  );
}

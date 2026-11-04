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

export function App() {
  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>React · TypeScript · Web Audio</p>
          <h1>SynthOfDoom</h1>
        </div>
        <span className={styles.phaseBadge}>Phase 1 · Foundation</span>
      </header>

      <main>
        <section className={styles.intro} aria-labelledby="foundation-title">
          <p className={styles.kicker}>Modernisation in progress</p>
          <h2 id="foundation-title">The signal path starts here.</h2>
          <p>
            The modern application shell is running. Audio remains deliberately
            disconnected until the framework-independent synth engine is built.
          </p>
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
        <span>Static build ready</span>
        <span aria-hidden="true">·</span>
        <span>Audio engine pending</span>
      </footer>
    </div>
  );
}

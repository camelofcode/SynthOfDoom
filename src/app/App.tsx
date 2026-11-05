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
        <span className={styles.phaseBadge}>Phase 2 · Domain model</span>
      </header>

      <main>
        <section className={styles.intro} aria-labelledby="foundation-title">
          <p className={styles.kicker}>Domain contracts ready</p>
          <h2 id="foundation-title">The signal path has a contract.</h2>
          <p>
            Every parameter now has a stable identity, safe range, display
            format, and versioned patch value. Audio remains deliberately
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
        <span>Domain model ready</span>
        <span aria-hidden="true">·</span>
        <span>Audio engine pending</span>
      </footer>
    </div>
  );
}

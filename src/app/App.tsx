import type { SynthEngineStatus } from '../audio/SynthEngine';
import { synthEngine } from '../audio/engineInstance';
import { PianoKeyboard } from '../components/keyboard/PianoKeyboard';
import { SynthInterface } from '../components/panels/SynthInterface';
import { PresetBar } from '../components/presets/PresetBar';
import { Oscilloscope } from '../components/visualisers/Oscilloscope';
import { useSynthEngine } from '../hooks/useSynthEngine';
import { useMidi } from '../hooks/useMidi';
import { useMidiLearn } from '../hooks/useMidiLearn';
import { useNoteInput } from '../hooks/useNoteInput';
import { PARAMETER_IDS, PARAMETER_REGISTRY } from '../synth/parameters';
import styles from './App.module.scss';

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

const midiLearnableParameters = PARAMETER_IDS.filter(
  (id) => PARAMETER_REGISTRY[id].midiLearnable,
);

export function App() {
  const audio = useSynthEngine();
  const notes = useNoteInput(audio.status === 'running');
  const midi = useMidi();
  const learn = useMidiLearn();
  const canStart = !['starting', 'running', 'disposed'].includes(audio.status);

  const startAudio = () => {
    void audio.start().catch(() => {
      // The engine publishes an actionable failure message through its snapshot.
    });
  };

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <h1>SynthOfDoom</h1>
      </header>

      <PresetBar />

      <main>
        <section className={styles.audioPanel} aria-labelledby="audio-title">
          <div>
            <h2 id="audio-title">Audio: {statusLabels[audio.status]}</h2>
            {audio.error ? (
              <p className={styles.audioError} role="alert">
                {audio.error}
              </p>
            ) : null}
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

        <section className={styles.inputPanel} aria-labelledby="input-title">
          <div className={styles.inputHeader}>
            <h2 id="input-title">Keyboard and MIDI</h2>
            <span aria-live="polite">
              {notes.activeNotes.length} active note
              {notes.activeNotes.length === 1 ? '' : 's'}
            </span>
          </div>
          <PianoKeyboard
            activeNotes={notes.activeNotes}
            disabled={audio.status !== 'running'}
          />
          <p className={styles.inputHelp}>
            Computer keys Q–I play C4–C5. Z/X shifts the keyboard octave.
          </p>
          <div className={styles.midiRow}>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => void midi.request()}
              disabled={midi.status === 'requesting'}
            >
              {midi.status === 'ready' ? 'Refresh MIDI' : 'Enable MIDI'}
            </button>
            <label>
              MIDI input
              <select
                value={midi.selectedInputId}
                onChange={(event) => midi.selectInput(event.target.value)}
                disabled={midi.status !== 'ready'}
              >
                <option value="all">All inputs</option>
                {midi.inputs.map((input) => (
                  <option key={input.id} value={input.id}>
                    {input.name}
                  </option>
                ))}
              </select>
            </label>
            <span className={styles.midiStatus} aria-live="polite">
              MIDI: {midi.error ?? midi.status}
            </span>
          </div>
          <div className={styles.midiRow}>
            <label>
              MIDI learn target
              <select
                value={learn.learning ?? ''}
                onChange={(event) => {
                  const id = event.target.value;
                  if (id) learn.begin(id as (typeof PARAMETER_IDS)[number]);
                  else learn.cancel();
                }}
              >
                <option value="">Not learning</option>
                {midiLearnableParameters.map((id) => (
                  <option key={id} value={id}>
                    {PARAMETER_REGISTRY[id].group} ·{' '}
                    {PARAMETER_REGISTRY[id].label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => learn.clear()}
            >
              Clear MIDI mappings
            </button>
            <span className={styles.midiStatus} aria-live="polite">
              {learn.learning
                ? 'Move a MIDI CC to bind it.'
                : `${learn.bindings.length} MIDI mapping${learn.bindings.length === 1 ? '' : 's'}`}
            </span>
          </div>
        </section>

        <SynthInterface />
        <Oscilloscope
          analyser={synthEngine.getAnalyser()}
          active={audio.status === 'running'}
        />
      </main>
    </div>
  );
}

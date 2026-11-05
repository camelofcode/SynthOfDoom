import { useEffect, useState } from 'react';
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
import styles from './App.module.scss';

const ACCENT_STORAGE_KEY = 'synth-of-doom:accent';
const DEFAULT_ACCENT = '#76d04b';

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

function loadAccent(): string {
  try {
    const stored = localStorage.getItem(ACCENT_STORAGE_KEY);
    return stored && /^#[0-9a-f]{6}$/iu.test(stored) ? stored : DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

export function App() {
  const audio = useSynthEngine();
  const notes = useNoteInput(audio.status === 'running');
  const midi = useMidi();
  const learn = useMidiLearn();
  const [accent, setAccent] = useState(loadAccent);
  const canStart = !['starting', 'running', 'disposed'].includes(audio.status);

  useEffect(() => {
    const root = document.documentElement;
    const previousAccent = root.style.getPropertyValue('--colour-accent');
    root.style.setProperty('--colour-accent', accent);
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, accent);
    } catch {
      // The selected colour still applies for this session without persistence.
    }
    return () => {
      if (previousAccent)
        root.style.setProperty('--colour-accent', previousAccent);
      else root.style.removeProperty('--colour-accent');
    };
  }, [accent]);

  const startAudio = () => {
    void audio.start().catch(() => {
      // The engine publishes an actionable failure message through its snapshot.
    });
  };

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <h1>SynthOfDoom</h1>
        <PresetBar />
        <label className={styles.accentPicker}>
          <span>Accent</span>
          <input
            type="color"
            value={accent}
            aria-label="Synth accent colour"
            onChange={(event) => setAccent(event.target.value)}
          />
        </label>
        <section
          className={styles.audioControl}
          data-needs-action={canStart || undefined}
          aria-labelledby="audio-title"
        >
          <div className={styles.audioStatus}>
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
      </header>

      <main>
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
            audioReady={audio.status === 'running'}
            onRequestAudio={audio.start}
          />
          <p className={styles.inputHelp}>
            Click a piano key or use Start audio to enable sound. Computer keys
            Q–I play C4–C5; Z/X shifts the keyboard octave.
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
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => learn.clear()}
            >
              Clear MIDI mappings
            </button>
            <span className={styles.midiStatus} aria-live="polite">
              {learn.learning
                ? 'MIDI learn active: move a CC to bind it.'
                : `${learn.bindings.length} MIDI mapping${learn.bindings.length === 1 ? '' : 's'}`}
            </span>
          </div>
        </section>

        <SynthInterface />
        <Oscilloscope
          analyser={synthEngine.getAnalyser()}
          active={audio.status === 'running'}
          accent={accent}
        />
      </main>
    </div>
  );
}

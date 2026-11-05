import { useRef } from 'react';
import { usePresets } from '../../hooks/usePresets';
import styles from './PresetBar.module.scss';

function confirmDiscard(): boolean {
  return window.confirm('Discard the unsaved changes to the current patch?');
}

export function PresetBar() {
  const presets = usePresets();
  const fileInput = useRef<HTMLInputElement>(null);
  const actions = useRef<HTMLDetailsElement>(null);
  const selected = presets.presets.find(
    (preset) => preset.id === presets.selectedId,
  );
  const isUserPreset = selected?.kind === 'user';
  const closeActions = () => actions.current?.removeAttribute('open');

  const selectPreset = (id: string) => {
    if (id === presets.selectedId) return;
    if (presets.dirty && !confirmDiscard()) return;
    presets.manager.select(id);
  };

  const saveAs = () => {
    const name = window.prompt(
      'Name this preset:',
      selected?.name ?? 'My patch',
    );
    if (name) presets.manager.saveAs(name);
  };

  const rename = () => {
    if (!isUserPreset || !selected) return;
    const name = window.prompt('Rename this preset:', selected.name);
    if (name) presets.manager.rename(selected.id, name);
  };

  const deletePreset = () => {
    if (!isUserPreset || !selected) return;
    if (window.confirm(`Delete the preset “${selected.name}”?`)) {
      presets.manager.delete(selected.id);
    }
  };

  const exportPreset = () => {
    const json = presets.manager.exportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${(selected?.name ?? 'synth-patch').replace(/[^a-z0-9]+/giu, '-').toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importPreset = async (file: File | undefined) => {
    if (!file) return;
    if (presets.dirty && !confirmDiscard()) return;
    try {
      presets.manager.importJson(await file.text());
    } catch {
      // The manager exposes a safe, user-facing import error in its snapshot.
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <section className={styles.presetBar} aria-label="Preset controls">
      <label className={styles.presetPicker}>
        <span>Preset</span>
        <select
          aria-label="Preset"
          value={presets.selectedId}
          onChange={(event) => selectPreset(event.target.value)}
        >
          <optgroup label="Factory patches">
            {presets.presets
              .filter((preset) => preset.kind === 'factory')
              .map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
          </optgroup>
          {presets.presets.some((preset) => preset.kind === 'user') ? (
            <optgroup label="My patches">
              {presets.presets
                .filter((preset) => preset.kind === 'user')
                .map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
            </optgroup>
          ) : null}
        </select>
      </label>
      <span className={styles.dirtyState} aria-live="polite">
        {presets.dirty ? 'Unsaved changes' : 'Saved'}
      </span>
      <details ref={actions} className={styles.actions}>
        <summary>Preset actions</summary>
        <div className={styles.actionMenu}>
          <button
            type="button"
            onClick={() => {
              if (!presets.dirty || confirmDiscard())
                presets.manager.initialise();
              closeActions();
            }}
          >
            Initialise
          </button>
          <button
            type="button"
            onClick={() => {
              saveAs();
              closeActions();
            }}
          >
            Save as
          </button>
          <button
            type="button"
            onClick={() => {
              rename();
              closeActions();
            }}
            disabled={!isUserPreset}
          >
            Rename
          </button>
          <button
            type="button"
            onClick={() => {
              presets.manager.duplicate(presets.selectedId);
              closeActions();
            }}
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => {
              deletePreset();
              closeActions();
            }}
            disabled={!isUserPreset}
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => {
              fileInput.current?.click();
              closeActions();
            }}
          >
            Import
          </button>
          <button
            type="button"
            onClick={() => {
              exportPreset();
              closeActions();
            }}
          >
            Export
          </button>
        </div>
      </details>
      <input
        ref={fileInput}
        className={styles.fileInput}
        type="file"
        accept="application/json,.json"
        aria-label="Import preset JSON"
        onChange={(event) => void importPreset(event.target.files?.[0])}
      />
      {presets.error ? (
        <p className={styles.error} role="alert">
          {presets.error}
        </p>
      ) : null}
    </section>
  );
}

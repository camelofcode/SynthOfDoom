import { useId, type KeyboardEvent } from 'react';

import { parameterValueToNormalised } from '../../synth/parameterMapping';
import type { NumericParameterDefinition } from '../../synth/parameters';
import styles from './Controls.module.scss';

export interface KnobProps {
  readonly definition: NumericParameterDefinition;
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly disabled?: boolean;
  readonly id?: string;
  readonly accessibleLabel?: string;
}

function clampAndStep(
  value: number,
  definition: NumericParameterDefinition,
): number {
  const clamped = Math.min(
    definition.maximum,
    Math.max(definition.minimum, value),
  );
  const steps = Math.round((clamped - definition.minimum) / definition.step);
  return Number((definition.minimum + steps * definition.step).toFixed(12));
}

export function Knob({
  definition,
  value,
  onChange,
  disabled = false,
  id,
  accessibleLabel,
}: KnobProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const safeValue = clampAndStep(value, definition);
  const position = parameterValueToNormalised(definition, safeValue);
  const angle = -135 + position * 270;
  const valueText = definition.formatValue(safeValue);

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    let next: number | null = null;
    const pageStep = Math.max(
      definition.step * 10,
      (definition.maximum - definition.minimum) / 10,
    );

    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
      next = safeValue + definition.step;
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
      next = safeValue - definition.step;
    } else if (event.key === 'PageUp') {
      next = safeValue + pageStep;
    } else if (event.key === 'PageDown') {
      next = safeValue - pageStep;
    } else if (event.key === 'Home') {
      next = definition.minimum;
    } else if (event.key === 'End') {
      next = definition.maximum;
    }

    if (next !== null) {
      event.preventDefault();
      onChange(clampAndStep(next, definition));
    }
  };

  return (
    <div className={styles.knob} data-disabled={disabled || undefined}>
      <label className={styles.controlLabel} htmlFor={inputId}>
        {definition.label}
      </label>
      <div className={styles.knobFace}>
        <svg viewBox="0 0 100 100" focusable="false" aria-hidden="true">
          <circle className={styles.knobTrack} cx="50" cy="50" r="43" />
          <circle className={styles.knobBody} cx="50" cy="50" r="34" />
          <g
            className={styles.knobIndicator}
            style={{ transform: `rotate(${angle}deg)` }}
          >
            <line x1="50" y1="50" x2="50" y2="23" />
            <circle cx="50" cy="50" r="4" />
          </g>
        </svg>
        <input
          id={inputId}
          className={styles.knobInput}
          type="range"
          min={definition.minimum}
          max={definition.maximum}
          step={definition.step}
          value={safeValue}
          aria-label={accessibleLabel}
          aria-valuetext={valueText}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          onKeyDown={keyDown}
          onDoubleClick={() => onChange(definition.defaultValue)}
        />
      </div>
      <output className={styles.valueReadout} htmlFor={inputId}>
        {valueText}
      </output>
      <button
        className={styles.resetButton}
        type="button"
        disabled={disabled || safeValue === definition.defaultValue}
        onClick={() => onChange(definition.defaultValue)}
        aria-label={`Reset ${accessibleLabel ?? definition.label} to default`}
      >
        Reset
      </button>
    </div>
  );
}

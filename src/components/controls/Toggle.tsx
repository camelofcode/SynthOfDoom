import styles from './Controls.module.scss';

export function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
  accessibleLabel,
}: {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly disabled?: boolean;
  readonly accessibleLabel?: string;
}) {
  return (
    <button
      className={styles.toggle}
      type="button"
      aria-pressed={checked}
      aria-label={`${accessibleLabel ?? label}: ${checked ? 'On' : 'Off'}`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.toggleState} aria-hidden="true">
        {checked ? '●' : '○'}
      </span>
      <span>{label}</span>
      <span className={styles.stateText}>{checked ? 'On' : 'Off'}</span>
    </button>
  );
}

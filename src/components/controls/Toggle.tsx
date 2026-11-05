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
  const stateLabel = checked ? 'On' : 'Off';

  return (
    <button
      className={styles.toggle}
      type="button"
      aria-pressed={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.toggleState} aria-hidden="true">
        {checked ? '●' : '○'}
      </span>
      <span>{label}</span>{' '}
      <span className={styles.stateText}>{stateLabel}</span>
      {accessibleLabel ? (
        <>
          {' '}
          <span className={styles.accessibleContext}>{accessibleLabel}</span>
        </>
      ) : null}
    </button>
  );
}

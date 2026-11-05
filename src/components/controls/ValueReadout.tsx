import styles from './Controls.module.scss';

export function ValueReadout({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className={styles.standaloneReadout}>
      <span>{label}</span>
      <output>{value}</output>
    </div>
  );
}

export function StatusIndicator({
  label,
  status,
}: {
  readonly label: string;
  readonly status: 'active' | 'inactive' | 'warning';
}) {
  return (
    <span
      className={styles.statusIndicator}
      data-status={status}
      role="status"
      aria-label={`${label}: ${status}`}
    >
      <span aria-hidden="true">
        {status === 'active' ? '●' : status === 'warning' ? '▲' : '○'}
      </span>
      {label}: {status}
    </span>
  );
}

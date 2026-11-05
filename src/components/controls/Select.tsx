import { useId } from 'react';
import type { EnumOption } from '../../synth/parameters';
import styles from './Controls.module.scss';

export function Select<Value extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  readonly label: string;
  readonly value: Value;
  readonly options: readonly EnumOption<Value>[];
  readonly onChange: (value: Value) => void;
  readonly disabled?: boolean;
}) {
  const id = useId();
  return (
    <label className={styles.selectLabel} htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as Value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

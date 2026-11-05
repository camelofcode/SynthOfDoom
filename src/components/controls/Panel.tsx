import { useId, type ReactNode } from 'react';
import styles from './Controls.module.scss';

export function Panel({
  title,
  eyebrow,
  children,
  actions,
}: {
  readonly title: string;
  readonly eyebrow?: string;
  readonly children: ReactNode;
  readonly actions?: ReactNode;
}) {
  const id = useId();
  return (
    <section className={styles.panel} aria-labelledby={id}>
      <header className={styles.panelHeader}>
        <div>
          {eyebrow ? <p>{eyebrow}</p> : null}
          <h2 id={id}>{title}</h2>
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

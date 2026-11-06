import type { ReactNode } from 'react';
import styles from './ui.module.css';

interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Card({ title, subtitle, action, className, children }: CardProps) {
  return (
    <section className={[styles.card, className].filter(Boolean).join(' ')}>
      {(title || action) && (
        <header className={styles.cardHeader}>
          <div>
            {title && <h2 className={styles.cardTitle}>{title}</h2>}
            {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

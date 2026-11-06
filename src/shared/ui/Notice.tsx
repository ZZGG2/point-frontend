import type { ReactNode } from 'react';
import type { Tone } from './Badge';
import styles from './ui.module.css';

const ICONS: Record<Tone, string> = {
  good: '✓',
  warning: '!',
  critical: '✕',
  neutral: 'i',
  info: 'i',
};

/** 결과/안내 메시지 박스. 오류는 role="alert", 그 외는 role="status" */
export function Notice({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <div
      role={tone === 'critical' ? 'alert' : 'status'}
      className={`${styles.notice} ${styles[tone]}`}
    >
      <span className={styles.icon} aria-hidden="true">
        {ICONS[tone]}
      </span>
      <div>{children}</div>
    </div>
  );
}

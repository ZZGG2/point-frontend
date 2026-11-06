import type { ReactNode } from 'react';
import styles from './ui.module.css';

export type Tone = 'good' | 'warning' | 'critical' | 'neutral' | 'info';

/** 상태 색은 항상 아이콘 + 글자와 함께 쓴다 (색만으로 의미 전달 금지) */
const ICONS: Record<Tone, string> = {
  good: '●',
  warning: '▲',
  critical: '✕',
  neutral: '○',
  info: '◆',
};

export function Badge({
  tone,
  children,
  icon = true,
}: {
  tone: Tone;
  children: ReactNode;
  icon?: boolean;
}) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {icon && <span aria-hidden="true">{ICONS[tone]}</span>}
      {children}
    </span>
  );
}

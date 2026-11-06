import type { ReactNode } from 'react';
import { Badge } from '@/shared/ui/Badge';
import type { ComponentStatus } from '../api/useSystemInfo';
import { STATUS_LABEL, statusTone, type ComponentState } from './systemMetrics';
import styles from './system.module.css';

export interface KeyValue {
  label: string;
  value: ReactNode;
}

interface ComponentPanelProps {
  name: string;
  status: ComponentStatus;
  rows: KeyValue[];
  hint?: ReactNode;
}

/** 외부 구성요소(DB/Redis/Kafka) 한 개의 점검 결과 */
export function ComponentPanel({ name, status, rows, hint }: ComponentPanelProps) {
  const state = status.status as ComponentState;
  return (
    <div className={styles.component}>
      <div className={styles.componentHead}>
        <span className={styles.componentName}>{name}</span>
        <Badge tone={statusTone(state)}>
          {STATUS_LABEL[state]}
          {status.latencyMs != null && ` · ${status.latencyMs}ms`}
        </Badge>
      </div>
      {state === 'UP' && (
        <dl className={styles.kv}>
          {rows
            .filter((r) => r.value !== undefined && r.value !== null && r.value !== '')
            .map((r) => (
              <div key={r.label} style={{ display: 'contents' }}>
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
        </dl>
      )}
      {status.error && (
        <p className={state === 'DOWN' ? styles.error : styles.hint}>{status.error}</p>
      )}
      {hint && state === 'UP' && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}

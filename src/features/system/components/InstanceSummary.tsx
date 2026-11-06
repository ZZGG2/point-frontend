import { Stat } from '@/shared/ui/Stat';
import type { InstanceInfo } from '../api/useSystemInfo';
import { formatUptime } from './systemMetrics';
import styles from './system.module.css';

/** 응답한 인스턴스(Pod) 정보 */
export function InstanceSummary({ instance }: { instance: InstanceInfo }) {
  return (
    <div className={styles.instanceGrid}>
      <Stat
        label="인스턴스 (Pod)"
        value={<span className={styles.mono}>{instance.instance}</span>}
      />
      <Stat
        label="프로필"
        value={instance.profiles.length ? instance.profiles.join(', ') : 'default'}
      />
      <Stat
        label="가동 시간"
        value={formatUptime(instance.uptimeSeconds)}
        hint={`Java ${instance.javaVersion}`}
      />
    </div>
  );
}

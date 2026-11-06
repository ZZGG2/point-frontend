import { ArchitectureMap } from '@/features/system/components/ArchitectureMap';
import { EventServiceCard } from '@/features/system/components/EventServiceCard';
import { LedgerOverview } from '@/features/system/components/LedgerOverview';
import { LoadBalancePanel } from '@/features/system/components/LoadBalancePanel';
import { MonolithCard } from '@/features/system/components/MonolithCard';
import styles from './Page.module.css';

/** 운영·인프라 검증 화면: 서비스/DB/Redis/Kafka 상태, 부하 분산, 원장 데이터 */
export function SystemPage() {
  return (
    <div className={styles.stack}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>시스템 상태</h1>
          <p className={styles.lead}>
            WAS 와 데이터 계층이 실제로 어떻게 연결되어 동작하는지 확인합니다. (상태 API 5초 · 원장
            3초마다 갱신)
          </p>
        </div>
      </header>

      <ArchitectureMap />
      <div className={styles.grid2}>
        <MonolithCard />
        <EventServiceCard />
      </div>
      <div className={styles.grid2}>
        <LedgerOverview />
        <LoadBalancePanel />
      </div>
    </div>
  );
}

import { EventAdminPanel } from '@/features/event/components/EventAdminPanel';
import { ArchitectureMap } from '@/features/system/components/ArchitectureMap';
import { EventServiceCard } from '@/features/system/components/EventServiceCard';
import { LedgerOverview } from '@/features/system/components/LedgerOverview';
import { LoadBalancePanel } from '@/features/system/components/LoadBalancePanel';
import { MonolithCard } from '@/features/system/components/MonolithCard';
import { CURRENT_EVENT_ID } from './currentEvent';
import styles from './Page.module.css';

/** 관리자 콘솔: 시스템 상태, 원장, 부하 분산, 이벤트 관리 */
export function AdminPage() {
  return (
    <div className={styles.adminStack}>
      <div className={styles.adminHead}>
        <h1 className={styles.title}>관리자 콘솔</h1>
        <span className={styles.adminSub}>5초마다 자동 갱신</span>
      </div>
      <ArchitectureMap />
      <div className={styles.grid2}>
        <MonolithCard />
        <EventServiceCard />
      </div>
      <div className={styles.grid2}>
        <LedgerOverview />
        <div className={styles.adminStack}>
          <EventAdminPanel eventId={CURRENT_EVENT_ID} />
          <LoadBalancePanel />
        </div>
      </div>
    </div>
  );
}

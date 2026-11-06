import { AttendanceButton } from '@/features/event/components/AttendanceButton';
import { BalanceHero } from '@/features/point/components/BalanceHero';
import { PointHistory } from '@/features/point/components/PointHistory';
import { UsePointForm } from '@/features/point/components/UsePointForm';
import { Card } from '@/shared/ui/Card';
import styles from './Page.module.css';

export function HomePage() {
  return (
    <div className={styles.stack}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>내 포인트</h1>
          <p className={styles.lead}>잔액 확인, 출석체크, 포인트 사용과 거래 내역을 한곳에서.</p>
        </div>
      </header>

      <div className={styles.heroGrid}>
        <div className={styles.sideStack}>
          <BalanceHero />
          <Card title="출석체크" subtitle="출석 보상은 Kafka 를 거쳐 몇 초 뒤 원장에 반영됩니다">
            <AttendanceButton />
          </Card>
        </div>
        <Card title="포인트 사용" subtitle="Idempotency-Key 로 중복 차감을 막습니다">
          <UsePointForm />
        </Card>
      </div>

      <Card title="포인트 거래 내역" subtitle="최근 20건 · 2초마다 자동 갱신">
        <PointHistory />
      </Card>
    </div>
  );
}

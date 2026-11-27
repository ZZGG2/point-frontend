import { useEffect, useState } from 'react';
import { checkHealth, RECHECK_INTERVAL_MS, type SystemStatus } from '@/shared/api/systemStatus';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import styles from './MaintenancePage.module.css';

const TIME = new Intl.DateTimeFormat('ko-KR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** 서비스(core-service) 이용 불가 시 전체 화면. 주기적으로 다시 확인하고, 회복되면 원래 화면으로 돌아간다 */
export function MaintenancePage({ status }: { status: Extract<SystemStatus, { state: 'down' }> }) {
  useEffect(() => {
    const previous = document.title;
    document.title = '서비스 점검 중 · 포인트';
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className={styles.screen}>
      <main className={styles.panel} aria-labelledby="maintenance-title">
        <span className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            P
          </span>
          포인트
        </span>
        <span className={styles.illustration} aria-hidden="true">
          <Icon name="settings" size={40} strokeWidth={1.8} />
        </span>
        <div className={styles.text}>
          <h1 id="maintenance-title" className={styles.title}>
            서비스 점검 중이에요
          </h1>
          <p className={styles.body}>
            더 안정적인 서비스를 위해 잠시 점검하고 있어요.
            <br />
            점검이 끝나면 자동으로 다시 연결돼요.
          </p>
        </div>
        <div className={styles.safe}>
          <Icon name="check" size={18} strokeWidth={2.4} />
          보유 포인트와 이용 내역은 안전하게 보관돼 있어요
        </div>
        <div className={styles.actions}>
          <Button size="lg" block disabled={status.checking} onClick={() => void checkHealth()}>
            {status.checking ? '확인하는 중…' : '지금 다시 시도'}
          </Button>
          <RecheckHint checkedAt={status.checkedAt} checking={status.checking} />
        </div>
      </main>
    </div>
  );
}

function RecheckHint({ checkedAt, checking }: { checkedAt: number; checking: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  // now 는 1초마다 갱신되므로 checkedAt 보다 조금 이전일 수 있다 → 주기보다 크게 보이지 않게 제한
  const remaining = Math.min(
    RECHECK_INTERVAL_MS / 1000,
    Math.max(0, Math.ceil((checkedAt + RECHECK_INTERVAL_MS - now) / 1000)),
  );
  return (
    <p className={styles.hint} aria-live="polite">
      {checking
        ? '연결 상태를 확인하고 있어요'
        : `마지막 확인 ${TIME.format(checkedAt)} · ${remaining}초 뒤 다시 확인`}
    </p>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { useDevUserId } from '@/shared/dev/devUser';
import { Button } from '@/shared/ui/Button';
import { Notice } from '@/shared/ui/Notice';
import { useUsePoint, type UsePointResult } from '../api/useUsePoint';
import styles from './point.module.css';

const newKey = () => crypto.randomUUID();

function resultMessage(r: UsePointResult, resent: boolean) {
  switch (r.kind) {
    case 'USED':
      return resent
        ? `같은 키로 다시 보냈지만 추가 차감은 없습니다. 현재 잔액 ${r.balance.toLocaleString('ko-KR')}P (멱등 처리)`
        : `사용 완료! 남은 잔액 ${r.balance.toLocaleString('ko-KR')}P`;
    case 'INSUFFICIENT_BALANCE':
      return '포인트 잔액이 부족합니다.';
    case 'INVALID_REQUEST':
      return '요청 값이 올바르지 않습니다.';
  }
}

/** 포인트 사용 + Idempotency-Key 동작 확인 (같은 키 재전송 → 1번만 차감) */
export function UsePointForm() {
  const userId = useDevUserId();
  const [amount, setAmount] = useState(100);
  const [merchantRef, setMerchantRef] = useState('demo-store');
  const [idempotencyKey, setIdempotencyKey] = useState(newKey);
  const [resent, setResent] = useState(false);
  const usePoint = useUsePoint();
  const { reset } = usePoint;

  useEffect(() => {
    reset();
    setIdempotencyKey(newKey());
  }, [userId, reset]);

  const send = (sameKey: boolean) => {
    const key = sameKey ? idempotencyKey : newKey();
    setIdempotencyKey(key);
    setResent(sameKey);
    usePoint.mutate({ amount, merchantRef, idempotencyKey: key });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(false);
  };

  const canSubmit = amount >= 1 && merchantRef.trim().length > 0 && !usePoint.isPending;

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.row}>
        <label className={styles.field}>
          사용 금액 (P)
          <input
            className={styles.input}
            type="number"
            min={1}
            step={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </label>
        <label className={styles.field}>
          가맹점 참조
          <input
            className={styles.input}
            value={merchantRef}
            onChange={(e) => setMerchantRef(e.target.value)}
          />
        </label>
      </div>
      <div>
        <span className={styles.hint}>Idempotency-Key</span>
        <div className={styles.key}>{idempotencyKey}</div>
      </div>
      <div className={styles.row}>
        <Button type="submit" disabled={!canSubmit}>
          사용하기 (새 키)
        </Button>
        <Button
          variant="secondary"
          disabled={!canSubmit || !usePoint.data}
          onClick={() => send(true)}
          title="직전 요청과 같은 키로 재전송 — 네트워크 재시도 상황 재현"
        >
          같은 키로 재전송
        </Button>
      </div>
      {usePoint.data && (
        <Notice tone={usePoint.data.kind === 'USED' ? (resent ? 'info' : 'good') : 'warning'}>
          {resultMessage(usePoint.data, resent)}
        </Notice>
      )}
      {usePoint.isError && <Notice tone="critical">잠시 후 다시 시도해 주세요.</Notice>}
    </form>
  );
}

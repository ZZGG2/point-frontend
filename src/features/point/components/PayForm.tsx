import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevUserId } from '@/shared/dev/devUser';
import { newIdempotencyKey } from '@/shared/lib/idempotencyKey';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { usePointBalance } from '../api/usePointBalance';
import { useUsePoint } from '../api/useUsePoint';
import { formatPoint } from '../model/ledgerView';
import { findMerchant, MERCHANTS } from '../model/merchants';
import styles from './point.module.css';

const QUICK_AMOUNTS = [100, 500, 1000];

type Done = { merchant: string; amount: number; balance: number };

export function PayForm() {
  const userId = useDevUserId();
  const navigate = useNavigate();
  const { data: balance } = usePointBalance();
  const pay = useUsePoint();
  const [merchantId, setMerchantId] = useState(MERCHANTS[0].id);
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState<Done | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  /**
   * 멱등키: 결제 버튼을 누를 때 만들고, 네트워크 오류로 "다시 시도"할 때는 같은 키를 재사용한다
   * → 응답만 유실된 경우에도 두 번 차감되지 않는다. 결과를 받으면 비운다.
   */
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  useEffect(() => {
    setDone(null);
    setFailure(null);
    setPendingKey(null);
    setAmount('');
  }, [userId]);

  const value = Number(amount) || 0;
  const over = balance != null && value > balance;
  const canPay = value > 0 && !over && !pay.isPending;
  const merchant = findMerchant(merchantId) ?? MERCHANTS[0];

  const submit = () => {
    const key = pendingKey ?? newIdempotencyKey();
    setPendingKey(key);
    setFailure(null);
    pay.mutate(
      { amount: value, merchantRef: merchant.id, idempotencyKey: key },
      {
        onSuccess: (result) => {
          setPendingKey(null);
          if (result.kind === 'USED') {
            setDone({ merchant: merchant.name, amount: value, balance: result.balance });
            setAmount('');
          } else if (result.kind === 'INSUFFICIENT_BALANCE') {
            setFailure('포인트가 부족해요');
          } else {
            setFailure('결제할 수 없는 금액이에요');
          }
        },
        onError: () => setFailure('연결이 원활하지 않아요. 다시 시도해 주세요.'),
      },
    );
  };

  if (done) {
    return (
      <Card>
        <div className={styles.done}>
          <span className={styles.doneIcon}>
            <Icon name="check" size={32} strokeWidth={2.6} />
          </span>
          <p className={styles.doneTitle}>{formatPoint(done.amount)} 결제 완료</p>
          <p className={styles.doneSub}>
            {done.merchant} · 남은 포인트 {formatPoint(done.balance)}
          </p>
          <div className={styles.doneActions}>
            <Button variant="ghost" size="lg" block onClick={() => navigate('/history')}>
              내역 보기
            </Button>
            <Button size="lg" block onClick={() => setDone(null)}>
              확인
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={styles.payStack}>
      <Card>
        <p className={styles.sectionTitle}>어디서 쓸까요?</p>
        <div className={styles.merchants}>
          {MERCHANTS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={styles.merchant}
              aria-pressed={m.id === merchantId}
              onClick={() => setMerchantId(m.id)}
            >
              <Icon name={m.icon} size={26} />
              {m.name}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <p className={styles.sectionTitle}>얼마나 쓸까요?</p>
        <label className={styles.amountField}>
          <input
            className={styles.amountInput}
            inputMode="numeric"
            placeholder="0"
            aria-label="사용할 포인트"
            value={amount ? Number(amount).toLocaleString('ko-KR') : ''}
            onChange={(e) => {
              setAmount(e.target.value.replace(/[^0-9]/g, '').slice(0, 9));
              setPendingKey(null);
              setFailure(null);
            }}
          />
          <span className={styles.amountUnit}>P</span>
        </label>
        <p className={`${styles.amountHint} ${over ? styles.amountHintError : ''}`}>
          {over
            ? '보유 포인트보다 많아요'
            : balance != null
              ? `사용 가능 ${formatPoint(balance)}`
              : ' '}
        </p>
        <div className={styles.chips}>
          {QUICK_AMOUNTS.map((n) => (
            <button
              key={n}
              type="button"
              className={styles.chip}
              onClick={() => {
                setAmount(String(value + n));
                setPendingKey(null);
              }}
            >
              +{n.toLocaleString('ko-KR')}
            </button>
          ))}
          {balance != null && balance > 0 && (
            <button
              type="button"
              className={styles.chip}
              onClick={() => {
                setAmount(String(balance));
                setPendingKey(null);
              }}
            >
              전액
            </button>
          )}
        </div>
      </Card>

      {failure && (
        <p className={styles.payError} role="alert">
          {failure}
        </p>
      )}
      <Button size="lg" block disabled={!canPay} onClick={submit}>
        {pay.isPending
          ? '결제 중…'
          : pendingKey
            ? '다시 시도'
            : value > 0
              ? `${formatPoint(value)} 결제하기`
              : '결제하기'}
      </Button>
    </div>
  );
}

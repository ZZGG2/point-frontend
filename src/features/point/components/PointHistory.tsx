import { Badge, type Tone } from '@/shared/ui/Badge';
import { usePointHistory } from '../api/usePointHistory';
import styles from './point.module.css';

const TYPE_LABEL: Record<string, { label: string; tone: Tone }> = {
  EARN: { label: '적립', tone: 'good' },
  USE: { label: '사용', tone: 'info' },
  REFUND: { label: '환불', tone: 'neutral' },
  EXPIRE: { label: '소멸', tone: 'warning' },
  CANCEL: { label: '취소', tone: 'neutral' },
};

export function PointHistory() {
  const { data = [], isLoading, isError } = usePointHistory();
  if (isLoading) return <p className={styles.empty}>내역 조회 중…</p>;
  if (isError)
    return (
      <p role="alert" className={styles.empty}>
        내역을 불러오지 못했습니다.
      </p>
    );
  if (data.length === 0) return <p className={styles.empty}>거래 내역이 없습니다.</p>;
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>일시</th>
            <th>유형</th>
            <th className={styles.num}>금액</th>
            <th className={styles.num}>잔액</th>
            <th>출처</th>
          </tr>
        </thead>
        <tbody>
          {data.map((e) => {
            const type = TYPE_LABEL[e.type ?? ''] ?? {
              label: e.type ?? '-',
              tone: 'neutral' as Tone,
            };
            const amount = e.amount ?? 0;
            return (
              <tr key={e.id}>
                <td>{e.createdAt ? new Date(e.createdAt).toLocaleString('ko-KR') : '-'}</td>
                <td>
                  <Badge tone={type.tone} icon={false}>
                    {type.label}
                  </Badge>
                </td>
                <td className={`${styles.num} ${amount >= 0 ? styles.plus : styles.minus}`}>
                  {amount > 0 ? '+' : ''}
                  {amount.toLocaleString('ko-KR')}
                </td>
                <td className={styles.num}>{e.balanceAfter?.toLocaleString('ko-KR')}</td>
                <td>
                  {e.source}
                  {e.referenceId && <span className={styles.ref}>{e.referenceId}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

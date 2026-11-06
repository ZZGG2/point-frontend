import { usePointBalance } from '../api/usePointBalance';

export function PointBalance() {
  const { data, isLoading, isError } = usePointBalance();
  if (isLoading) return <p>잔액 조회 중…</p>;
  if (isError) return <p role="alert">잔액을 불러오지 못했습니다.</p>;
  return <p>보유 포인트: {data?.toLocaleString('ko-KR')}P</p>;
}

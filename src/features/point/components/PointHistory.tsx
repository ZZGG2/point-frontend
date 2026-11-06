import { usePointHistory } from '../api/usePointHistory';

export function PointHistory() {
  const { data = [], isLoading, isError } = usePointHistory();
  if (isLoading) return <p>내역 조회 중…</p>;
  if (isError) return <p role="alert">내역을 불러오지 못했습니다.</p>;
  if (data.length === 0) return <p>거래 내역이 없습니다.</p>;
  return (
    <table>
      <thead>
        <tr>
          <th>일시</th>
          <th>유형</th>
          <th>금액</th>
          <th>잔액</th>
          <th>출처</th>
        </tr>
      </thead>
      <tbody>
        {data.map((e) => (
          <tr key={e.id}>
            <td>{e.createdAt ? new Date(e.createdAt).toLocaleString('ko-KR') : '-'}</td>
            <td>{e.type}</td>
            <td>{e.amount?.toLocaleString('ko-KR')}</td>
            <td>{e.balanceAfter?.toLocaleString('ko-KR')}</td>
            <td>
              {e.source}
              {e.referenceId ? ` (${e.referenceId})` : ''}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

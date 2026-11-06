import { AttendanceButton } from '@/features/event/components/AttendanceButton';
import { PointHistory } from '@/features/point/components/PointHistory';

export function HomePage() {
  return (
    <main>
      <AttendanceButton />
      <h2>포인트 거래 내역</h2>
      <PointHistory />
    </main>
  );
}

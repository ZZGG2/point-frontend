import { useEffect } from 'react';
import { useDevUserId } from '@/shared/dev/devUser';
import { useAttendance } from '../api/useAttendance';
import { MaintenanceBanner } from './MaintenanceBanner';

const MESSAGES = {
  ATTENDED: '출석 완료! 포인트가 곧 지급됩니다.',
  ALREADY_ATTENDED: '오늘은 이미 출석했습니다.',
} as const;

export function AttendanceButton() {
  const userId = useDevUserId();
  const attendance = useAttendance();
  const { reset } = attendance;

  // 테스트 사용자를 바꾸면 이전 결과를 지운다
  useEffect(() => reset(), [userId, reset]);

  if (attendance.data === 'MAINTENANCE') return <MaintenanceBanner />;

  return (
    <section>
      <button type="button" onClick={() => attendance.mutate()} disabled={attendance.isPending}>
        출석체크
      </button>
      {attendance.data && <p>{MESSAGES[attendance.data]}</p>}
      {attendance.isError && <p role="alert">잠시 후 다시 시도해 주세요.</p>}
    </section>
  );
}

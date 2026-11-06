import { useEffect } from 'react';
import { useDevUserId } from '@/shared/dev/devUser';
import { Button } from '@/shared/ui/Button';
import { Notice } from '@/shared/ui/Notice';
import { useAttendance } from '../api/useAttendance';
import { MaintenanceBanner } from './MaintenanceBanner';
import styles from './event.module.css';

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

  const now = new Date();
  return (
    <section>
      <div className={styles.attendance}>
        <div className={styles.calendar} aria-hidden="true">
          <div className={styles.calendarMonth}>{now.getMonth() + 1}월</div>
          <div className={styles.calendarDay}>{now.getDate()}</div>
        </div>
        <p className={styles.attendanceText}>
          하루 한 번 출석하면 포인트를 드려요. (KST 기준 1일 1회 · Redis Bitmap)
        </p>
        <Button onClick={() => attendance.mutate()} disabled={attendance.isPending}>
          출석체크
        </Button>
      </div>
      {attendance.data && (
        <Notice tone={attendance.data === 'ATTENDED' ? 'good' : 'neutral'}>
          {MESSAGES[attendance.data]}
        </Notice>
      )}
      {attendance.isError && <Notice tone="critical">잠시 후 다시 시도해 주세요.</Notice>}
    </section>
  );
}

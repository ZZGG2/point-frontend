import { useEffect } from 'react';
import { useDevUserId } from '@/shared/dev/devUser';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { useAttendance } from '../api/useAttendance';
import { MaintenanceBanner } from './MaintenanceBanner';
import styles from './event.module.css';

/** 출석 보상 (서버 설정 app.attendance.reward-amount 기본값과 맞춤) */
const ATTENDANCE_REWARD = 10;

export function AttendanceCard() {
  const userId = useDevUserId();
  const attendance = useAttendance();
  const { reset } = attendance;

  useEffect(() => reset(), [userId, reset]);

  if (attendance.data === 'MAINTENANCE') return <MaintenanceBanner />;

  const done = attendance.data === 'ATTENDED' || attendance.data === 'ALREADY_ATTENDED';
  const sub = attendance.isError
    ? '잠시 후 다시 시도해 주세요'
    : attendance.data === 'ATTENDED'
      ? `${ATTENDANCE_REWARD}P가 곧 적립돼요`
      : attendance.data === 'ALREADY_ATTENDED'
        ? '내일 또 만나요'
        : `출석하면 ${ATTENDANCE_REWARD}P를 드려요`;

  return (
    <Card>
      <div className={styles.row}>
        <span className={`${styles.bubble} ${styles.bubbleAccent}`}>
          <Icon name="calendar" size={24} />
        </span>
        <div className={styles.rowBody}>
          <p className={styles.rowTitle}>매일 출석체크</p>
          <p
            className={`${styles.rowSub} ${done ? styles.rowSubDone : ''} ${attendance.isError ? styles.rowSubError : ''}`}
            role={attendance.isError ? 'alert' : undefined}
          >
            {sub}
          </p>
        </div>
        <Button
          size="sm"
          variant={done ? 'ghost' : 'primary'}
          disabled={done || attendance.isPending}
          onClick={() => attendance.mutate()}
        >
          {done ? '출석 완료' : '출석하기'}
        </Button>
      </div>
    </Card>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevUserId } from '@/shared/dev/devUser';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { claimedRatio, useEventStatus } from '../api/useEventStatus';
import { useSubmitAnswer, type AnswerResult } from '../api/useSubmitAnswer';
import { MaintenanceBanner } from './MaintenanceBanner';
import styles from './event.module.css';

const RESULT: Record<
  Exclude<AnswerResult, 'MAINTENANCE'>,
  { title: string; sub: (reward: string) => string; win: boolean }
> = {
  WON: { title: '당첨됐어요!', sub: (r) => `${r}가 곧 적립돼요`, win: true },
  LOST: { title: '아쉽게도 마감됐어요', sub: () => '다음 퀴즈에 다시 도전해 주세요', win: false },
  DUPLICATE: { title: '이미 참여했어요', sub: () => '퀴즈는 한 번만 참여할 수 있어요', win: false },
  CLOSED: {
    title: '진행 중인 퀴즈가 아니에요',
    sub: () => '다음 퀴즈를 기다려 주세요',
    win: false,
  },
};

export function QuizCard({ eventId }: { eventId: string }) {
  const navigate = useNavigate();
  const userId = useDevUserId();
  const [answer, setAnswer] = useState('');
  const { data: statusState } = useEventStatus(eventId);
  const submit = useSubmitAnswer(eventId);
  const { reset } = submit;

  useEffect(() => {
    reset();
    setAnswer('');
  }, [userId, reset]);

  if (submit.data === 'MAINTENANCE' || statusState?.kind === 'MAINTENANCE') {
    return <MaintenanceBanner />;
  }

  const status = statusState?.kind === 'OK' ? statusState.status : undefined;
  const reward = status ? `${status.rewardAmount.toLocaleString('ko-KR')}P` : '포인트';
  const total = status ? status.winners + status.remainingStock : 0;

  if (submit.data) {
    const r = RESULT[submit.data];
    return (
      <Card>
        <div className={styles.result}>
          <span className={`${styles.resultIcon} ${r.win ? styles.resultWin : styles.resultMiss}`}>
            <Icon name={r.win ? 'gift' : 'x'} size={30} />
          </span>
          <p className={styles.resultTitle}>{r.title}</p>
          <p className={styles.resultSub}>{r.sub(reward)}</p>
          <Button size="lg" block onClick={() => navigate('/')}>
            확인
          </Button>
        </div>
      </Card>
    );
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit.mutate(answer.trim());
  };

  return (
    <Card>
      <div className={styles.quizHero}>
        <span className={styles.quizTag}>선착순 {total > 0 ? `${total}명` : ''}</span>
        <p className={styles.quizReward}>{reward}</p>
        <p className={styles.quizRewardSub}>정답을 제출하면 바로 결과를 알려드려요</p>
      </div>

      {status && total > 0 && (
        <>
          <div className={styles.meter} aria-hidden="true">
            <div className={styles.meterFill} style={{ width: `${claimedRatio(status) * 100}%` }} />
          </div>
          <div className={styles.meterLabel}>
            <span>
              남은 자리 <strong>{status.remainingStock}</strong>
            </span>
            <span>
              {status.winners}/{total}명 당첨
            </span>
          </div>
        </>
      )}

      <form onSubmit={onSubmit}>
        <p className={styles.question}>Q. 이 서비스가 장애에 대비해 쓰는 재해 복구(DR) 전략은?</p>
        <input
          className={styles.answerInput}
          aria-label="정답"
          placeholder="정답 입력"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        {submit.isError && (
          <p className={styles.formError} role="alert">
            잠시 후 다시 시도해 주세요
          </p>
        )}
        <Button type="submit" size="lg" block disabled={submit.isPending || !answer.trim()}>
          {submit.isPending ? '제출 중…' : '제출하기'}
        </Button>
      </form>
    </Card>
  );
}

import { useEffect, useState, type FormEvent } from 'react';
import { useDevUserId } from '@/shared/dev/devUser';
import { Button } from '@/shared/ui/Button';
import { Notice } from '@/shared/ui/Notice';
import type { Tone } from '@/shared/ui/Badge';
import { useSubmitAnswer } from '../api/useSubmitAnswer';
import { MaintenanceBanner } from './MaintenanceBanner';
import styles from './event.module.css';

const MESSAGES = {
  WON: '당첨! 포인트가 곧 지급됩니다. (상단 잔액이 몇 초 안에 갱신돼요)',
  LOST: '아쉽지만 선착순이 마감되었습니다.',
  DUPLICATE: '이미 참여한 이벤트입니다.',
  CLOSED: '진행 중인 이벤트가 아닙니다.',
} as const;

const TONES: Record<keyof typeof MESSAGES, Tone> = {
  WON: 'good',
  LOST: 'warning',
  DUPLICATE: 'neutral',
  CLOSED: 'neutral',
};

export function QuizAnswerForm({ eventId }: { eventId: string }) {
  const [answer, setAnswer] = useState('');
  const userId = useDevUserId();
  const submit = useSubmitAnswer(eventId);
  const { reset } = submit;

  // 테스트 사용자를 바꾸면 이전 결과를 지운다
  useEffect(() => reset(), [userId, reset]);

  if (submit.data === 'MAINTENANCE') return <MaintenanceBanner />;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit.mutate(answer);
  };

  return (
    <form className={styles.stack} onSubmit={onSubmit}>
      <p className={styles.question}>
        Q. 이 프로젝트의 DR 전략은?
        <span className={styles.questionHint}>아무 답이나 제출하면 참여로 처리됩니다.</span>
      </p>
      <div className={styles.row}>
        <input
          className={styles.input}
          aria-label="정답"
          placeholder="정답을 입력하세요"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <Button type="submit" disabled={submit.isPending || !answer}>
          {submit.isPending ? '제출 중…' : '제출'}
        </Button>
      </div>
      {submit.data && <Notice tone={TONES[submit.data]}>{MESSAGES[submit.data]}</Notice>}
      {submit.isError && <Notice tone="critical">잠시 후 다시 시도해 주세요.</Notice>}
    </form>
  );
}

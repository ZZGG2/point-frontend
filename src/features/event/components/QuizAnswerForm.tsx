import { useEffect, useState, type FormEvent } from 'react';
import { useDevUserId } from '@/shared/dev/devUser';
import { useSubmitAnswer } from '../api/useSubmitAnswer';
import { MaintenanceBanner } from './MaintenanceBanner';

const MESSAGES = {
  WON: '당첨! 포인트가 곧 지급됩니다. (상단 잔액이 몇 초 안에 갱신돼요)',
  LOST: '아쉽지만 선착순이 마감되었습니다.',
  DUPLICATE: '이미 참여한 이벤트입니다.',
  CLOSED: '진행 중인 이벤트가 아닙니다.',
} as const;

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
    <form onSubmit={onSubmit}>
      <p>Q. 이 프로젝트의 DR 전략은? (아무 답이나 제출하면 참여로 처리됩니다)</p>
      <input aria-label="정답" value={answer} onChange={(e) => setAnswer(e.target.value)} />
      <button type="submit" disabled={submit.isPending || !answer}>
        제출
      </button>
      {submit.data && <p>{MESSAGES[submit.data]}</p>}
      {submit.isError && <p role="alert">잠시 후 다시 시도해 주세요.</p>}
    </form>
  );
}

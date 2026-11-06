import { useParams } from 'react-router-dom';
import { QuizAnswerForm } from '@/features/event/components/QuizAnswerForm';

export function EventPage() {
  const { eventId = '' } = useParams();
  return (
    <main>
      <h2>선착순 퀴즈 ({eventId})</h2>
      <QuizAnswerForm eventId={eventId} />
    </main>
  );
}

import { useMutation } from '@tanstack/react-query';
import { apiClient, ERROR_CODES } from '@/shared/api/client';
import { useDevUserId } from '@/shared/dev/devUser';

export type AttendanceResult = 'ATTENDED' | 'ALREADY_ATTENDED' | 'MAINTENANCE';

/** HTTP 상태 → 화면 상태. 202 출석은 "지급 예정" (원장 반영은 Kafka 경유 비동기) */
export function toAttendanceResult(status: number, errorCode?: string): AttendanceResult {
  switch (status) {
    case 202:
      return 'ATTENDED';
    case 409:
      return 'ALREADY_ATTENDED';
    case 503:
      if (errorCode === ERROR_CODES.EVENT_MAINTENANCE) return 'MAINTENANCE';
      // EVENT_RETRY 등: 서버가 출석 기록을 되돌렸으므로 다시 누르면 된다
      throw new Error('SERVICE_UNAVAILABLE');
    default:
      throw new Error(`UNEXPECTED_${status}`);
  }
}

export function useAttendance() {
  const userId = useDevUserId();
  return useMutation({
    mutationFn: async (): Promise<AttendanceResult> => {
      const { response, error } = await apiClient.POST('/api/events/attendance', {
        params: { header: { 'X-User-Id': userId } },
      });
      const code = error && 'code' in error ? (error.code as string | undefined) : undefined;
      return toAttendanceResult(response.status, code);
    },
  });
}

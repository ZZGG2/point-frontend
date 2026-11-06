import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import { useDevUserId } from '@/shared/dev/devUser';

export type UsePointResult =
  | { kind: 'USED'; balance: number }
  | { kind: 'INSUFFICIENT_BALANCE' }
  | { kind: 'INVALID_REQUEST' };

/** HTTP 상태 → 화면 상태. 같은 Idempotency-Key 재전송은 서버가 다시 차감하지 않고 200 + 현재 잔액을 준다 */
export function toUsePointResult(status: number, balance?: number): UsePointResult {
  switch (status) {
    case 200:
      return { kind: 'USED', balance: balance ?? 0 };
    case 409:
      return { kind: 'INSUFFICIENT_BALANCE' };
    case 400:
      return { kind: 'INVALID_REQUEST' };
    default:
      throw new Error(`UNEXPECTED_${status}`);
  }
}

export interface UsePointVariables {
  amount: number;
  merchantRef: string;
  /** 요청마다 새 UUID. 재시도(네트워크 오류 등)는 같은 키를 재사용해야 이중 차감이 없다 */
  idempotencyKey: string;
}

export function useUsePoint() {
  const userId = useDevUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount, merchantRef, idempotencyKey }: UsePointVariables) => {
      const { response, data } = await apiClient.POST('/api/points/use', {
        params: { header: { 'X-User-Id': userId, 'Idempotency-Key': idempotencyKey } },
        body: { amount, merchantRef },
      });
      return toUsePointResult(response.status, data?.data?.balance);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['point'] }),
  });
}

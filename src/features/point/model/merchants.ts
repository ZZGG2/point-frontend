import type { IconName } from '@/shared/ui/Icon';

/** 데모 가맹점 (가맹점 API 도입 전까지 고정 목록). id 는 결제 요청의 merchantRef 로 전송된다 */
export const MERCHANTS: { id: string; name: string; icon: IconName }[] = [
  { id: 'cafe-moment', name: '카페 모먼트', icon: 'coffee' },
  { id: 'daily-mart', name: '데일리 마트', icon: 'store' },
  { id: 'page-books', name: '페이지 북스', icon: 'book' },
];

export function findMerchant(id: string | null | undefined) {
  return MERCHANTS.find((m) => m.id === id);
}

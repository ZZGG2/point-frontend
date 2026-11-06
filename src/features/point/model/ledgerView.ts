import type { components } from '@/shared/api/schema';
import type { IconName } from '@/shared/ui/Icon';
import { findMerchant } from './merchants';

export type LedgerEntry = components['schemas']['LedgerEntry'];

export interface LedgerView {
  title: string;
  icon: IconName;
}

/** 원장 한 줄을 사용자가 읽을 수 있는 이름으로 바꾼다 (EVENT / attendance-20261106 → "출석 체크 보상") */
export function describeLedger(
  e: Pick<LedgerEntry, 'type' | 'source' | 'referenceId'>,
): LedgerView {
  const ref = e.referenceId ?? '';
  switch (e.type) {
    case 'REFUND':
      return { title: '결제 취소 환불', icon: 'coin' };
    case 'EXPIRE':
      return { title: '포인트 소멸', icon: 'coin' };
    case 'CANCEL':
      return { title: '사용 취소', icon: 'coin' };
  }
  switch (e.source) {
    case 'EVENT':
      if (ref.startsWith('attendance-')) return { title: '출석 체크 보상', icon: 'calendar' };
      return { title: '선착순 퀴즈 당첨', icon: 'gift' };
    case 'PAYMENT': {
      const merchant = findMerchant(ref);
      // 모르는 가맹점 id 는 그대로 노출하지 않는다
      return merchant
        ? { title: merchant.name, icon: merchant.icon }
        : { title: '가맹점 결제', icon: 'card' };
    }
    case 'ADMIN':
      return { title: '포인트 지급', icon: 'coin' };
    default:
      return { title: e.type === 'USE' ? '포인트 사용' : '포인트 적립', icon: 'coin' };
  }
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** 날짜 그룹 제목: 오늘 / 어제 / 11월 3일 (올해가 아니면 연도 포함) */
export function dayLabel(date: Date, now = new Date()): string {
  if (sameDay(date, now)) return '오늘';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, yesterday)) return '어제';
  const md = `${date.getMonth() + 1}월 ${date.getDate()}일`;
  return date.getFullYear() === now.getFullYear() ? md : `${date.getFullYear()}년 ${md}`;
}

/** 최신순 목록을 날짜별로 묶는다 (입력 순서 유지) */
export function groupByDay<T extends { createdAt?: string }>(
  entries: readonly T[],
  now = new Date(),
): { label: string; items: T[] }[] {
  const groups: { label: string; items: T[] }[] = [];
  for (const e of entries) {
    const label = e.createdAt ? dayLabel(new Date(e.createdAt), now) : '날짜 없음';
    const last = groups.at(-1);
    if (last && last.label === label) last.items.push(e);
    else groups.push({ label, items: [e] });
  }
  return groups;
}

export function formatTime(iso: string | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export const formatPoint = (n: number) => `${n.toLocaleString('ko-KR')}P`;

export const formatSignedPoint = (n: number) => `${n > 0 ? '+' : ''}${formatPoint(n)}`;

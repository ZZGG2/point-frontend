import { useSyncExternalStore } from 'react';

/**
 * 로컬 개발용 임시 사용자 (X-User-Id 헤더). 메모리에만 보관 — localStorage 사용 금지 규칙 준수.
 * TODO(#이슈): JWT 로그인 도입 시 제거
 */
let currentUserId = 1;
const listeners = new Set<() => void>();

export function setDevUserId(id: number) {
  currentUserId = id;
  listeners.forEach((l) => l());
}

export function useDevUserId(): number {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => currentUserId,
  );
}

import createClient from 'openapi-fetch';
import { useSyncExternalStore } from 'react';
import { API_BASE_URL } from './baseUrl';
import type { paths } from './schema';

/**
 * 서비스(core-service) 이용 가능 여부.
 * API 가 5xx·네트워크 오류를 내면 /api/health 로 한 번 더 확인해서, 그것도 실패해야 'down'(점검 화면) 으로 본다
 * → 특정 API 의 일시 오류(버그성 500 등)로 화면 전체를 막지 않는다.
 * 'down' 동안에는 주기적으로 다시 확인하고, 회복되면 onSystemRecover 콜백을 부른다.
 */
export type SystemStatus =
  { state: 'up' } | { state: 'down'; checkedAt: number; checking: boolean };

export const RECHECK_INTERVAL_MS = 5_000;

const healthClient = createClient<paths>({ baseUrl: API_BASE_URL });

let status: SystemStatus = { state: 'up' };
const listeners = new Set<() => void>();
const recoverListeners = new Set<() => void>();
let checking: Promise<boolean> | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

function set(next: SystemStatus) {
  const recovered = status.state === 'down' && next.state === 'up';
  status = next;
  listeners.forEach((l) => l());
  if (recovered) recoverListeners.forEach((l) => l());
}

function scheduleRecheck() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void checkHealth();
  }, RECHECK_INTERVAL_MS);
}

/** /api/health 확인. 동시에 여러 번 불려도 요청은 한 번. @returns 이용 가능 여부 */
export function checkHealth(): Promise<boolean> {
  checking ??= (async () => {
    if (status.state === 'down') set({ ...status, checking: true });
    let ok = false;
    try {
      const { response } = await healthClient.GET('/api/health');
      ok = response.ok;
    } catch {
      ok = false; // 네트워크 오류: 게이트웨이·서버에 닿지 않음
    } finally {
      checking = null;
    }
    if (ok) {
      if (timer) clearTimeout(timer);
      timer = null;
      set({ state: 'up' });
    } else {
      set({ state: 'down', checkedAt: Date.now(), checking: false });
      scheduleRecheck();
    }
    return ok;
  })();
  return checking;
}

/** API 가 5xx·네트워크 오류를 냈을 때 호출 — 이미 점검 화면이면 주기 확인에 맡긴다 */
export function reportPossibleOutage(): void {
  if (status.state === 'down') return;
  void checkHealth();
}

export function getSystemStatus(): SystemStatus {
  return status;
}

export function onSystemRecover(listener: () => void): () => void {
  recoverListeners.add(listener);
  return () => recoverListeners.delete(listener);
}

export function useSystemStatus(): SystemStatus {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => status,
  );
}

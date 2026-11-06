import createClient from 'openapi-fetch';
import type { paths } from './schema';

/**
 * 모든 API 호출은 이 클라이언트를 사용한다. (컴포넌트에서 fetch 직접 호출 금지)
 * 타입은 point-backend/api/openapi.yaml 에서 생성: npm run gen:api
 * baseUrl 이 비어 있으면 같은 origin → 로컬은 Vite proxy, 운영은 ALB 경로 라우팅
 */
export const apiClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_BASE_URL || window.location.origin,
});

export const ERROR_CODES = {
  EVENT_MAINTENANCE: 'EVENT_MAINTENANCE',
} as const;

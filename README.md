# point-frontend

금융 포인트 플랫폼 웹 프론트엔드 — React 18 + Vite + TypeScript

- 설계 문서·ADR: [point-infra/docs](https://github.com/CHANGE_ME_ORG/point-infra/tree/main/docs)
- 작업 규칙: **[AGENTS.md](AGENTS.md)** (사람·AI 공통), [CONTRIBUTING.md](CONTRIBUTING.md)
- API 계약: `point-backend/api/openapi.yaml` → `npm run gen:api` 로 타입 생성

## 로컬 실행
```bash
npm install
npm run dev               # http://localhost:5173  (백엔드 8080/8081 이 떠 있어야 함)
npm run gen:api           # point-backend 가 형제 폴더에 있어야 함 (또는 OPENAPI_PATH 지정)
```

| 스크립트 | 내용 |
|---|---|
| `lint` / `typecheck` / `test` / `build` | CI 와 동일 |
| `gen:api` | OpenAPI → `src/shared/api/schema.d.ts` |

## 로컬 연결 방식
- `vite.config.ts` proxy: `/api/events/**` → `:8081`, 나머지 `/api/**` → `:8080` (운영 ALB 경로 라우팅과 동일, CORS 불필요)
- 인증 전 임시: 상단 **테스트 사용자** 선택값이 `X-User-Id` 헤더로 전송됨 (`src/shared/dev/`)

## 구조
```
src/
  app/        Router, QueryClient
  pages/      라우트 화면 (조립만)
  features/   auth · asset · point · event · cs  ({api, components, hooks})
  shared/     api 클라이언트(생성 타입), 공통 UI
```

## 배포 / DR
`main` 머지 → 빌드 → **S3(+CloudFront)와 GCS에 이중 업로드**.
AWS 장애 시 Route 53이 `www`를 GCP(Cloud Storage + Cloud CDN)로 전환하므로 같은 빌드가 그대로 동작한다.
DR 중 이벤트 API는 `503 EVENT_MAINTENANCE` → 점검 배너 표시 (`features/event/components/MaintenanceBanner.tsx`).

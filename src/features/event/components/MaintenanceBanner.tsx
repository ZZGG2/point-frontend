/** DR 모드 등으로 이벤트가 닫혔을 때 표시 (ADR-0004 선택적 복구) */
export function MaintenanceBanner() {
  return (
    <div role="status">
      이벤트는 시스템 점검으로 일시 중단되었습니다. 포인트 조회·사용 등 다른 기능은 정상 이용 가능합니다.
    </div>
  );
}

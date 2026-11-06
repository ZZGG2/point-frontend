import { setDevUserId, useDevUserId } from './devUser';

const USERS = [1, 2, 3, 4, 5];

/** 선착순/중복 참여를 여러 사용자로 테스트하기 위한 로컬 전용 스위처 */
export function DevUserSwitcher() {
  const userId = useDevUserId();
  return (
    <label>
      테스트 사용자{' '}
      <select value={userId} onChange={(e) => setDevUserId(Number(e.target.value))}>
        {USERS.map((id) => (
          <option key={id} value={id}>
            user {id}
          </option>
        ))}
      </select>
    </label>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { setDevUserId, useDevUserId } from '@/shared/dev/devUser';
import { Icon } from '@/shared/ui/Icon';
import styles from './Layout.module.css';

const TEST_ACCOUNTS = [1, 2, 3, 4, 5];

/**
 * 계정 메뉴. 로그인 도입 전까지는 테스트 계정 전환(X-User-Id) + 관리자 콘솔 진입점 역할.
 */
export function AccountMenu() {
  const userId = useDevUserId();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.account} ref={ref}>
      <button
        type="button"
        className={styles.accountButton}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.avatar}>{userId}</span>
        <span className={styles.accountName}>사용자 {userId}</span>
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <p className={styles.menuLabel}>테스트 계정 전환</p>
          {TEST_ACCOUNTS.map((id) => (
            <button
              key={id}
              type="button"
              role="menuitemradio"
              aria-checked={id === userId}
              className={styles.menuItem}
              onClick={() => {
                setDevUserId(id);
                setOpen(false);
              }}
            >
              <span className={styles.avatar}>{id}</span>
              사용자 {id}
              {id === userId && (
                <span className={styles.menuCheck}>
                  <Icon name="check" size={18} />
                </span>
              )}
            </button>
          ))}
          <div className={styles.menuDivider} />
          <Link
            to="/admin"
            role="menuitem"
            className={styles.menuItem}
            onClick={() => setOpen(false)}
          >
            <Icon name="settings" size={18} />
            관리자 콘솔
          </Link>
        </div>
      )}
    </div>
  );
}

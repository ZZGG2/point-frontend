import { Link, NavLink, Outlet } from 'react-router-dom';
import { DevUserSwitcher } from '@/shared/dev/DevUserSwitcher';
import { PointBalance } from '@/features/point/components/PointBalance';
import styles from './Layout.module.css';

const NAV = [
  { to: '/', label: '내 포인트', end: true },
  { to: '/events/evt-local', label: '퀴즈 이벤트', end: false },
  { to: '/system', label: '시스템 상태', end: false },
];

export function Layout() {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.logo} aria-hidden="true">
              P
            </span>
            Point Platform
          </Link>
          <nav className={styles.nav} aria-label="주 메뉴">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className={styles.tools}>
            <div className={styles.userSwitcher}>
              <DevUserSwitcher />
            </div>
            <PointBalance />
          </div>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>Point Platform · monolith + event-service</span>
          <span>로컬 개발 모드: 사용자 식별은 X-User-Id 헤더</span>
        </div>
      </footer>
    </div>
  );
}

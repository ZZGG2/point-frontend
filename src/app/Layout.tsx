import { Link, NavLink, Outlet, useMatch } from 'react-router-dom';
import { Icon, type IconName } from '@/shared/ui/Icon';
import { AccountMenu } from './AccountMenu';
import styles from './Layout.module.css';

const NAV: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: '홈', icon: 'home', end: true },
  { to: '/benefits', label: '혜택', icon: 'gift' },
  { to: '/pay', label: '결제', icon: 'card' },
  { to: '/history', label: '내역', icon: 'list' },
];

export function Layout() {
  // 관리자 콘솔만 넓은 화면, 나머지는 앱처럼 좁은 단일 컬럼
  const isAdmin = useMatch('/admin/*') != null;
  const width = isAdmin ? styles.wide : styles.narrow;

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={`${styles.headerInner} ${width}`}>
          <Link to="/" className={styles.brand}>
            <span className={styles.logo} aria-hidden="true">
              P
            </span>
            포인트
          </Link>
          <nav className={styles.topNav} aria-label="주 메뉴">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? `${styles.topLink} ${styles.topLinkActive}` : styles.topLink
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <AccountMenu />
        </div>
      </header>

      <main className={`${styles.main} ${width}`}>
        <Outlet />
      </main>

      <nav className={styles.tabBar} aria-label="하단 메뉴">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab
            }
          >
            <Icon name={item.icon} size={24} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

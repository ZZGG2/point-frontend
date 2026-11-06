import { Link, Outlet } from 'react-router-dom';
import { DevUserSwitcher } from '@/shared/dev/DevUserSwitcher';
import { PointBalance } from '@/features/point/components/PointBalance';

export function Layout() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <strong>Point Platform</strong>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">내 포인트</Link>
          <Link to="/events/evt-local">퀴즈 이벤트</Link>
        </nav>
        <DevUserSwitcher />
        <PointBalance />
      </header>
      <hr />
      <Outlet />
    </div>
  );
}

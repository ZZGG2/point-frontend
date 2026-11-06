import { render, screen } from '@testing-library/react';
import { MaintenanceBanner } from './MaintenanceBanner';

describe('MaintenanceBanner', () => {
  it('DR 모드 점검 안내를 표시한다', () => {
    render(<MaintenanceBanner />);
    expect(screen.getByRole('status')).toHaveTextContent('일시 중단');
  });
});

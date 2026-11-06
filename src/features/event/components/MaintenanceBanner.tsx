import { Icon } from '@/shared/ui/Icon';
import styles from './event.module.css';

/** 이벤트 서비스 점검(DR 모드 등) 시 표시. 포인트 기능은 계속 쓸 수 있다 */
export function MaintenanceBanner() {
  return (
    <div role="status" className={styles.banner}>
      <Icon name="alert" size={20} />
      <span>
        이벤트가 잠시 일시 중단됐어요.
        <br />
        포인트 조회·결제는 그대로 이용할 수 있어요.
      </span>
    </div>
  );
}

import { Icon } from '@/shared/ui/Icon';
import {
  describeLedger,
  formatPoint,
  formatSignedPoint,
  formatTime,
  type LedgerEntry,
} from '../model/ledgerView';
import styles from './point.module.css';

export function LedgerItem({ entry }: { entry: LedgerEntry }) {
  const view = describeLedger(entry);
  const amount = entry.amount ?? 0;
  const earn = amount > 0;
  return (
    <li className={styles.item}>
      <span className={`${styles.itemIcon} ${earn ? styles.itemIconEarn : ''}`}>
        <Icon name={view.icon} size={20} />
      </span>
      <div className={styles.itemBody}>
        <p className={styles.itemTitle}>{view.title}</p>
        <p className={styles.itemMeta}>{formatTime(entry.createdAt)}</p>
      </div>
      <div className={styles.itemAmount}>
        <p className={earn ? styles.amountEarn : styles.amountUse}>{formatSignedPoint(amount)}</p>
        {entry.balanceAfter != null && (
          <p className={styles.itemBalance}>{formatPoint(entry.balanceAfter)}</p>
        )}
      </div>
    </li>
  );
}

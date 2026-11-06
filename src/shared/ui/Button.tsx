import type { ButtonHTMLAttributes } from 'react';
import styles from './ui.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        styles.button,
        styles[variant],
        size !== 'md' && styles[size],
        block && styles.block,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    />
  );
}

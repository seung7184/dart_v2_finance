import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-accent)',
    color: 'var(--text-on-accent)',
    border: 'none',
  },
  secondary: {
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-muted)',
    border: 'none',
  },
  danger: {
    background: 'transparent',
    color: 'var(--color-warning)',
    border: '1px solid var(--color-warning)',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '4px 12px', fontSize: 'var(--text-sm)' },
  md: { padding: '8px 16px', fontSize: 'var(--text-base)' },
  lg: { padding: '12px 24px', fontSize: 'var(--text-lg)' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      style={{
        borderRadius: '6px',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--font-medium)' as React.CSSProperties['fontWeight'],
        transition: 'opacity 0.15s',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

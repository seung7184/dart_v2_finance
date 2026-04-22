import React from 'react';

type BadgeVariant = 'living' | 'investing' | 'transfer' | 'reimbursement' | 'warning' | 'protected';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const badgeColors: Record<BadgeVariant, { bg: string; color: string }> = {
  living:        { bg: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-accent)' },
  investing:     { bg: 'rgba(63, 185, 80, 0.15)',  color: 'var(--color-positive)' },
  transfer:      { bg: 'rgba(139, 148, 158, 0.15)', color: 'var(--color-text-muted)' },
  reimbursement: { bg: 'rgba(88, 166, 255, 0.15)', color: 'var(--color-safe)' },
  warning:       { bg: 'rgba(210, 153, 34, 0.15)', color: 'var(--color-warning)' },
  protected:     { bg: 'rgba(63, 185, 80, 0.15)',  color: 'var(--color-positive)' },
};

export function Badge({ variant, children }: BadgeProps) {
  const { bg, color } = badgeColors[variant];
  return (
    <span
      style={{
        background: bg,
        color,
        borderRadius: '4px',
        padding: '2px 8px',
        fontSize: 'var(--text-xs)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  );
}

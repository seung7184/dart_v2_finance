import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {label}
        </label>
      )}
      <input
        style={{
          background: 'var(--color-surface)',
          border: `1px solid ${error ? 'var(--color-warning)' : 'var(--color-border)'}`,
          borderRadius: '6px',
          color: 'var(--color-text)',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-base)',
          padding: '8px 12px',
          outline: 'none',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-warning)',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

import React from 'react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Transactions', href: '/transactions' },
  { label: 'Import', href: '/import' },
  { label: 'Why This Number?', href: '/why' },
];

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar — always dark */}
      <aside
        style={{
          width: '240px',
          minHeight: '100vh',
          background: 'var(--color-sidebar)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '0 24px 32px',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--color-safe)',
            }}
          >
            Dart Finance
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '8px 12px',
                borderRadius: '6px',
                color: 'var(--color-text-muted)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <main
        style={{
          flex: 1,
          background: 'var(--color-bg)',
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { requireAuthenticatedAppUser } from '@/auth/session';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: '⌂' },
  { label: 'Transactions', href: '/transactions', icon: '↔' },
  { label: 'Import CSV', href: '/import', icon: '↑' },
  { label: 'Why This Number?', href: '/why', icon: '?' },
];

export default async function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthenticatedAppUser();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '224px 1fr',
        minHeight: '100vh',
        background: 'var(--surface-0)',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          borderRight: '1px solid var(--border-subtle)',
          padding: '22px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          background: 'var(--surface-0)',
          position: 'sticky',
          top: 0,
          alignSelf: 'start',
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 8px 10px',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'var(--accent-500)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: '-0.02em',
              flexShrink: 0,
            }}
          >
            D
          </div>
          <div
            style={{
              fontSize: 14,
              color: 'var(--text-primary)',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            Dart Finance
          </div>
        </div>

        {/* Nav section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
              padding: '0 10px 6px',
            }}
          >
            Workspace
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 10px',
                  borderRadius: 8,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: '-0.005em',
                  transition: 'background var(--duration-fast) var(--ease-standard)',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer user section */}
        <div
          style={{
            marginTop: 'auto',
            padding: '10px 10px 0',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: 'var(--surface-2)',
                color: 'var(--text-primary)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 600,
                fontSize: 11,
                flexShrink: 0,
              }}
            >
              β
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 1 }}>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Beta user
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Private beta</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: 'var(--surface-0)',
        }}
      >
        {children}
      </main>
    </div>
  );
}

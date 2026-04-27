import React from 'react';
import { requireAuthenticatedAppUser } from '@/auth/session';
import { SidebarNav } from '@/layout/SidebarNav';
import { ThemeToggle } from '@/theme/ThemeToggle';

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
        gridTemplateColumns: '220px 1fr',
        minHeight: '100vh',
        background: 'var(--surface-0)',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          borderRight: '1px solid var(--border-subtle)',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'var(--surface-sidebar, var(--surface-0))',
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
            padding: '4px 8px 12px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'var(--accent-500)',
              color: 'var(--text-inverse)',
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

        {/* Nav */}
        <SidebarNav />

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            paddingTop: 12,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <ThemeToggle />
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--accent-400)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent-400)',
              }}
            />
            Free beta
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

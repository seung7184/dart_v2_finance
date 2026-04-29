import React from 'react';
import { requireAuthenticatedAppUser } from '@/auth/session';
import { SidebarBrand, SidebarNav } from '@/layout/SidebarNav';
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
        <SidebarBrand />

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

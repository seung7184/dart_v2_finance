'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DartLogoIcon } from '@/brand/DartLogo';

type NavItem = { label: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Transactions', href: '/transactions' },
  { label: 'Import CSV', href: '/import' },
  { label: 'Why This Number?', href: '/why' },
  { label: 'Settings', href: '/settings' },
];

export function SidebarBrand() {
  return (
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
          background: 'var(--accent-tint)',
          border: '1px solid var(--border-default)',
          color: 'var(--accent-400)',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <DartLogoIcon width={24} height={24} title="Dart Finance logo" />
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
  );
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '7px 10px',
              borderRadius: 8,
              color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: active ? 'var(--surface-2)' : 'transparent',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              letterSpacing: '-0.005em',
              transition: 'background var(--duration-fast) var(--ease-standard)',
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = { label: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Transactions', href: '/transactions' },
  { label: 'Import CSV', href: '/import' },
  { label: 'Why This Number?', href: '/why' },
  { label: 'Settings', href: '/settings' },
];

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

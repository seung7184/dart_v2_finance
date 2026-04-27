import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { BootstrapProviders } from '@/observability/BootstrapProviders';
import { THEME_SCRIPT } from '@/theme/theme-script';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dart Finance',
  description: 'Investor-aware safe-to-spend for the Netherlands',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakartaSans.variable} suppressHydrationWarning>
      <head>
        {/* Prevent theme flash — applies saved preference before first paint */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <BootstrapProviders />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { BootstrapProviders } from '@/observability/BootstrapProviders';
import { THEME_SCRIPT } from '@/theme/theme-script';
import './globals.css';

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
    <html lang="en" suppressHydrationWarning>
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

import type { CSSProperties } from 'react';
import { ThemeToggle } from '@/theme/ThemeToggle';

function eyebrowStyle(): CSSProperties {
  return {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-tertiary)',
    marginBottom: 10,
  };
}

function SectionCard({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SettingRow({
  label,
  description,
  control,
  first,
}: {
  label: string;
  description?: string;
  control?: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '16px 20px',
        borderTop: first ? 'none' : '1px solid var(--border-subtle)',
      }}
    >
      <div>
        <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{label}</div>
        {description && (
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{description}</div>
        )}
      </div>
      {control}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <div
        style={{
          padding: '18px 32px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--surface-0)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
          Appearance and account preferences
        </div>
      </div>

      <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
        {/* Appearance */}
        <section>
          <div style={eyebrowStyle()}>Appearance</div>
          <SectionCard>
            <SettingRow
              first
              label="Theme"
              description="Light or dark interface"
              control={<ThemeToggle />}
            />
          </SectionCard>
        </section>

        {/* Account */}
        <section>
          <div style={eyebrowStyle()}>Account</div>
          <SectionCard>
            <SettingRow
              first
              label="Beta access"
              description="Private beta — free until public launch"
              control={
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '3px 9px',
                    borderRadius: 999,
                    background: 'var(--positive-tint)',
                    color: 'var(--positive)',
                  }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                  Active
                </span>
              }
            />
            <SettingRow
              label="Billing"
              description="No card required during private beta"
              control={
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Not active</span>
              }
            />
          </SectionCard>
        </section>

        {/* Data */}
        <section>
          <div style={eyebrowStyle()}>Data</div>
          <SectionCard>
            <SettingRow
              first
              label="CSV imports"
              description="ING and Trading 212 supported"
            />
            <SettingRow
              label="Data export"
              description="Export your transactions and settings"
              control={
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Coming in v2.1</span>
              }
            />
            <SettingRow
              label="Delete account"
              description="Removes all your data within 24 hours"
              control={
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Contact support</span>
              }
            />
          </SectionCard>
        </section>

        {/* Legal */}
        <section>
          <div style={eyebrowStyle()}>Legal</div>
          <SectionCard>
            <SettingRow
              first
              label="Privacy notice"
              control={
                <a href="/privacy" style={{ fontSize: 13, color: 'var(--accent-400)' }}>View →</a>
              }
            />
            <SettingRow
              label="Terms of service"
              control={
                <a href="/terms" style={{ fontSize: 13, color: 'var(--accent-400)' }}>View →</a>
              }
            />
          </SectionCard>
        </section>

        <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          Questions? Email{' '}
          <a href="mailto:support@dart.eu" style={{ color: 'var(--accent-400)' }}>support@dart.eu</a>
        </p>
      </div>
    </div>
  );
}

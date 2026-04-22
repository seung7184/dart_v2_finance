import { Badge, Button, Card, Input } from '@dart/ui';
import { AUTH_COOKIE_NAME } from '@/auth/session';

export default function SignInPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '40px 24px', background: 'var(--color-bg)' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', display: 'grid', gap: '20px' }}>
        <div style={{ display: 'grid', gap: '8px' }}>
          <Badge variant="transfer">Auth scaffold</Badge>
          <h1 style={{ fontSize: 'var(--text-3xl)' }}>Sign in for beta access</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Protected app routes now deny access by default unless an authenticated session cookie
            is present. This page remains the handoff point until the real Supabase sign-in flow and
            callback wiring are connected.
          </p>
        </div>

        <Card style={{ display: 'grid', gap: '14px' }}>
          <Input label="Email" placeholder="name@example.com" disabled />
          <Input label="Password" type="password" placeholder="Password" disabled />
          <Button type="button" disabled>
            Sign in
          </Button>
          <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
            Live authentication still needs a real Supabase project, redirect URLs, callback
            handling, and session issuance for the `{AUTH_COOKIE_NAME}` cookie boundary.
          </p>
        </Card>
      </div>
    </main>
  );
}

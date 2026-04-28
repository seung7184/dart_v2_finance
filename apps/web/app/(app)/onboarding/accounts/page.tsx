import Link from 'next/link';
import { Button } from '@dart/ui';
import { completeOnboardingAction } from '@/onboarding/actions';
import { OnboardingLayout } from '../_components';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getValue(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
  fallback: string,
) {
  const value = searchParams[key];
  return typeof value === 'string' ? value : fallback;
}

function buildBackHref(payday: string, income: string, investing: string, protection: string) {
  return `/onboarding/investing?payday=${encodeURIComponent(
    payday,
  )}&income=${encodeURIComponent(income)}&investing=${encodeURIComponent(
    investing,
  )}&protection=${encodeURIComponent(protection)}`;
}

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const payday = getValue(params, 'payday', '30');
  const income = getValue(params, 'income', '350000');
  const investing = getValue(params, 'investing', '80000');
  const protection = getValue(params, 'protection', 'on');

  return (
    <OnboardingLayout
      step={4}
      title="Confirm your account setup"
      description="ING and Trading 212 accounts will be created automatically. Import your CSV after onboarding to load your transactions."
    >
      <div style={{ display: 'grid', gap: '18px' }}>
        <div
          style={{
            display: 'grid',
            gap: '16px',
            background: 'var(--color-bg)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gap: '12px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            }}
          >
            <div
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '16px',
                background: 'var(--color-surface)',
              }}
            >
              <p style={{ color: 'var(--color-safe)', fontSize: 'var(--text-xs)' }}>
                Bank
              </p>
              <h3 style={{ marginTop: '6px', fontSize: 'var(--text-xl)' }}>ING</h3>
              <p style={{ marginTop: '8px', color: 'var(--color-text-muted)' }}>
                Checking and accessible savings count toward available cash.
              </p>
            </div>

            <div
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '16px',
                background: 'var(--color-surface)',
              }}
            >
              <p style={{ color: 'var(--color-safe)', fontSize: 'var(--text-xs)' }}>
                Broker
              </p>
              <h3 style={{ marginTop: '6px', fontSize: 'var(--text-xl)' }}>Trading 212</h3>
              <p style={{ marginTop: '8px', color: 'var(--color-text-muted)' }}>
                Card spending defaults to living expense. Deposits default to transfer — edit if needed.
              </p>
            </div>
          </div>

          <div
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '16px',
              background: 'var(--color-sidebar)',
              display: 'grid',
              gap: '6px',
            }}
          >
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              Setup summary
            </p>
            <p>Payday day: {payday}</p>
            <p>Expected income: {income} cents</p>
            <p>Planned investing: {investing} cents</p>
            <p>Protection: {protection === 'on' ? 'On' : 'Off'}</p>
          </div>
        </div>

        <form action={completeOnboardingAction}>
          <input type="hidden" name="payday" value={payday} />
          <input type="hidden" name="income" value={income} />
          <input type="hidden" name="investing" value={investing} />
          <input type="hidden" name="protection" value={protection} />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href={buildBackHref(payday, income, investing, protection)}
              style={{ textDecoration: 'none' }}
            >
              <Button variant="ghost" type="button">
                Back
              </Button>
            </Link>

            <Button type="submit">
              Finish onboarding
            </Button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
}

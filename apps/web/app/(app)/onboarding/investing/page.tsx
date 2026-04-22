import { redirect } from 'next/navigation';
import { Card, Input } from '@dart/ui';
import { OnboardingLayout, StepActions } from '../_components';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getValue(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
  fallback: string,
) {
  const value = searchParams[key];
  return typeof value === 'string' ? value : fallback;
}

function buildBackHref(payday: string, income: string) {
  return `/onboarding/income?payday=${encodeURIComponent(payday)}&income=${encodeURIComponent(
    income,
  )}`;
}

export default async function InvestingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const payday = getValue(params, 'payday', '30');
  const income = getValue(params, 'income', '350000');

  if (params['next'] === 'accounts') {
    const investing = getValue(params, 'investing', '80000');
    const protection = getValue(params, 'protection', 'on');
    redirect(
      `/onboarding/accounts?payday=${encodeURIComponent(payday)}&income=${encodeURIComponent(
        income,
      )}&investing=${encodeURIComponent(investing)}&protection=${encodeURIComponent(
        protection,
      )}`,
    );
  }

  return (
    <OnboardingLayout
      step={3}
      title="Protect the planned investing amount"
      description="Dart Finance treats planned investing as protected by default. This step makes that policy visible before the first import."
    >
      <form style={{ display: 'grid', gap: '18px' }}>
        <Card
          style={{
            display: 'grid',
            gap: '16px',
            background: 'var(--color-bg)',
          }}
        >
          <Input
            label="Planned investing this month (EUR cents)"
            name="investing"
            type="number"
            min={0}
            defaultValue="80000"
          />

          <div style={{ display: 'grid', gap: '10px' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Protection setting
            </p>
            <label
              style={{
                display: 'flex',
                gap: '10px',
                padding: '12px',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
              }}
            >
              <input type="radio" name="protection" value="on" defaultChecked />
              <span>Protect my investing plan inside safe-to-spend</span>
            </label>
            <label
              style={{
                display: 'flex',
                gap: '10px',
                padding: '12px',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
              }}
            >
              <input type="radio" name="protection" value="off" />
              <span>Do not protect it for now</span>
            </label>
          </div>

          <input type="hidden" name="payday" value={payday} />
          <input type="hidden" name="income" value={income} />
          <input type="hidden" name="next" value="accounts" />
        </Card>

        <StepActions
          backHref={buildBackHref(payday, income)}
          nextLabel="Continue to accounts"
        />
      </form>
    </OnboardingLayout>
  );
}

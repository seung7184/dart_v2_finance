import { redirect } from 'next/navigation';
import { Input, Card } from '@dart/ui';
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

function buildBackHref(payday: string) {
  return `/onboarding/payday?payday=${encodeURIComponent(payday)}`;
}

export default async function IncomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const payday = getValue(params, 'payday', '30');

  if (params['next'] === 'investing') {
    const income = getValue(params, 'income', '350000');
    redirect(
      `/onboarding/investing?payday=${encodeURIComponent(payday)}&income=${encodeURIComponent(
        income,
      )}`,
    );
  }

  return (
    <OnboardingLayout
      step={2}
      title="Capture the income expectation"
      description="Use your expected monthly salary in integer cents so the setup matches the rest of the product model."
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
            label="Expected monthly income (EUR cents)"
            name="income"
            type="number"
            min={0}
            defaultValue="350000"
          />
          <input type="hidden" name="payday" value={payday} />
          <input type="hidden" name="next" value="investing" />
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            Example: €3,500.00 becomes 350000.
          </p>
        </Card>

        <StepActions backHref={buildBackHref(payday)} nextLabel="Continue to investing" />
      </form>
    </OnboardingLayout>
  );
}

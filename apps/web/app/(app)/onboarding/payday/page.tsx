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

export default async function PaydayPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  if (params['next'] === 'income') {
    const payday = getValue(params, 'payday', '30');
    redirect(`/onboarding/income?payday=${encodeURIComponent(payday)}`);
  }

  return (
    <OnboardingLayout
      step={1}
      title="Set the payday anchor"
      description="Safe-to-spend is calculated against payday, not month-end. Pick the date your salary usually lands."
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
            label="Typical payday day-of-month"
            name="payday"
            type="number"
            min={1}
            max={31}
            defaultValue="30"
          />
          <input type="hidden" name="next" value="income" />
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            We use your configured date as-is, even when it lands on a weekend.
          </p>
        </Card>

        <StepActions nextLabel="Continue to income" />
      </form>
    </OnboardingLayout>
  );
}

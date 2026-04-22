export type ReadinessStatus = 'configured' | 'pending_secret' | 'scaffolded';

export type ReadinessItem = {
  id: string;
  title: string;
  category: 'auth' | 'observability' | 'beta_ops' | 'billing';
  href: string;
  summary: string;
  status: ReadinessStatus;
  nextStep: string;
};

type ReadinessEnv = Record<string, string | undefined>;

function hasConfiguredValue(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized.length === 0) {
    return false;
  }

  return !['changeme', 'placeholder', 'todo', 'example'].includes(normalized);
}

function getProviderStatus(value: string | undefined): ReadinessStatus {
  return hasConfiguredValue(value) ? 'configured' : 'pending_secret';
}

export function getPhase3Readiness(env: ReadinessEnv): ReadinessItem[] {
  return [
    {
      id: 'auth',
      title: 'Auth entrypoint',
      category: 'auth',
      href: '/sign-in',
      summary: 'Web-first sign-in scaffold with explicit note that Supabase auth still needs live project wiring and RLS policy rollout.',
      status: 'scaffolded',
      nextStep: 'Connect Supabase auth and verify route protection against real beta accounts.',
    },
    {
      id: 'posthog',
      title: 'PostHog',
      category: 'observability',
      href: '/readiness',
      summary: 'Public-key-only analytics slot for beta funnel tracking. No events are emitted until a key is configured.',
      status: getProviderStatus(env.NEXT_PUBLIC_POSTHOG_KEY),
      nextStep: 'Set NEXT_PUBLIC_POSTHOG_KEY before enabling product analytics.',
    },
    {
      id: 'sentry',
      title: 'Sentry',
      category: 'observability',
      href: '/readiness',
      summary: 'Public DSN slot for frontend error reporting. Left inert until configuration is present.',
      status: getProviderStatus(env.NEXT_PUBLIC_SENTRY_DSN),
      nextStep: 'Set NEXT_PUBLIC_SENTRY_DSN and verify a captured client exception in staging.',
    },
    {
      id: 'privacy',
      title: 'Privacy notice',
      category: 'beta_ops',
      href: '/privacy',
      summary: 'Explains CSV-first handling, ING + Trading 212 V1 scope, and beta-only data expectations.',
      status: 'scaffolded',
      nextStep: 'Replace the placeholder contact channel once the beta support inbox is finalized.',
    },
    {
      id: 'beta',
      title: 'Beta waitlist',
      category: 'beta_ops',
      href: '/beta',
      summary: 'Static beta signup scaffold that collects intent only. No backend write path or email automation is assumed.',
      status: 'scaffolded',
      nextStep: 'Attach the form to a real intake workflow after legal copy and support ownership are locked.',
    },
    {
      id: 'stripe',
      title: 'Stripe',
      category: 'billing',
      href: '/billing',
      summary: 'Web billing placeholder for publishable-key setup only. No checkout session or live plan activation exists yet.',
      status: getProviderStatus(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      nextStep: 'Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and wire server-side checkout in a later phase.',
    },
    {
      id: 'revenuecat',
      title: 'RevenueCat',
      category: 'billing',
      href: '/billing',
      summary: 'Mobile billing readiness note retained in the web control surface so release ops stay synchronized.',
      status: getProviderStatus(env.NEXT_PUBLIC_REVENUECAT_APPLE_PUBLIC_KEY),
      nextStep: 'Set NEXT_PUBLIC_REVENUECAT_APPLE_PUBLIC_KEY when the mobile build is attached.',
    },
  ];
}

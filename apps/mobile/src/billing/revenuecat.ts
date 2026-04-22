export type RevenueCatBillingState = {
  entitlement: 'dart_pro';
  offering: 'beta_default';
  provider: 'revenuecat';
  publicKeyPresent: boolean;
  status: 'configured' | 'pending_secret';
};

type BillingEnv = Record<string, string | undefined>;

function hasValue(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function getRevenueCatBillingState(env: BillingEnv): RevenueCatBillingState {
  const publicKeyPresent = hasValue(env.EXPO_PUBLIC_REVENUECAT_APPLE_PUBLIC_KEY);

  return {
    entitlement: 'dart_pro',
    offering: 'beta_default',
    provider: 'revenuecat',
    publicKeyPresent,
    status: publicKeyPresent ? 'configured' : 'pending_secret',
  };
}


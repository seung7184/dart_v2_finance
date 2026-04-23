export type RevenueCatPlatform = 'ios' | 'android';

export type RevenueCatBillingStatus = 'configured' | 'partial' | 'pending_secret';
export type RevenueCatRuntimeStatus = 'sdk_missing' | 'sdk_ready';

export type RevenueCatPlatformState = {
  keyEnvName: string;
  packageIds: ['$rc_monthly', '$rc_annual'];
  platform: RevenueCatPlatform;
  publicKeyPresent: boolean;
  status: 'configured' | 'pending_secret';
};

export type RevenueCatBillingState = {
  apple: RevenueCatPlatformState;
  contractStatus: RevenueCatBillingStatus;
  entitlement: 'premium';
  google: RevenueCatPlatformState;
  offering: 'default';
  provider: 'revenuecat';
  runtimeStatus: RevenueCatRuntimeStatus;
  sdkInstalled: boolean;
};

type BillingEnv = Record<string, string | undefined>;

type RevenueCatOptions = {
  sdkInstalled?: boolean;
};

function hasValue(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}

function getPlatformState(
  env: BillingEnv,
  platform: RevenueCatPlatform,
): RevenueCatPlatformState {
  const keyEnvName =
    platform === 'ios'
      ? 'EXPO_PUBLIC_REVENUECAT_APPLE_PUBLIC_KEY'
      : 'EXPO_PUBLIC_REVENUECAT_GOOGLE_PUBLIC_KEY';
  const publicKeyPresent = hasValue(env[keyEnvName]);

  return {
    keyEnvName,
    packageIds: ['$rc_monthly', '$rc_annual'],
    platform,
    publicKeyPresent,
    status: publicKeyPresent ? 'configured' : 'pending_secret',
  };
}

export function getRevenueCatBillingState(
  env: BillingEnv,
  options: RevenueCatOptions = {},
): RevenueCatBillingState {
  const apple = getPlatformState(env, 'ios');
  const google = getPlatformState(env, 'android');
  const sdkInstalled = options.sdkInstalled ?? false;

  let contractStatus: RevenueCatBillingStatus = 'pending_secret';
  if (apple.publicKeyPresent && google.publicKeyPresent) {
    contractStatus = 'configured';
  } else if (apple.publicKeyPresent || google.publicKeyPresent) {
    contractStatus = 'partial';
  }

  return {
    apple,
    contractStatus,
    entitlement: 'premium',
    google,
    offering: 'default',
    provider: 'revenuecat',
    runtimeStatus: sdkInstalled ? 'sdk_ready' : 'sdk_missing',
    sdkInstalled,
  };
}

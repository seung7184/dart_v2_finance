import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';

import {
  MobileAuthSessionProvider,
  useMobileAuthSession,
} from '@/src/auth/session-provider';
import { mobileColors } from '@/src/theme';

export default function RootLayout() {
  return (
    <MobileAuthSessionProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: mobileColors.sidebar },
          headerTintColor: mobileColors.text,
          contentStyle: { backgroundColor: mobileColors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="quick-add"
          options={{
            headerShown: false,
            presentation: 'transparentModal',
            animation: 'slide_from_bottom',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
        <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
      </Stack>
      <AuthRouteGate />
    </MobileAuthSessionProvider>
  );
}

function AuthRouteGate() {
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { state } = useMobileAuthSession();
  const isAuthRoute = segments[0] === 'auth';
  const routeKey = segments.join('/');
  const isSignInRoute = routeKey === 'auth/sign-in';
  const isCallbackRoute = routeKey === 'auth/callback';
  const shouldHideCurrentRoute =
    state.status === 'loading' ||
    (state.status !== 'signed_in' && !isAuthRoute) ||
    (state.status === 'signed_in' && isSignInRoute);

  useEffect(() => {
    if (!rootNavigationState?.key || state.status === 'loading') {
      return;
    }

    if (state.status !== 'signed_in' && !isAuthRoute) {
      router.replace('/auth/sign-in');
      return;
    }

    if (state.status === 'signed_in' && isSignInRoute) {
      router.replace('/(tabs)');
    }
  }, [isAuthRoute, isSignInRoute, rootNavigationState?.key, router, state.status]);

  if (shouldHideCurrentRoute && !isCallbackRoute) {
    return (
      <View
        style={{
          alignItems: 'center',
          backgroundColor: mobileColors.background,
          bottom: 0,
          justifyContent: 'center',
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      >
        <ActivityIndicator color={mobileColors.safe} />
      </View>
    );
  }

  if (isCallbackRoute) {
    return null;
  }

  return null;
}

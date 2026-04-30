import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import {
  MobileAuthSessionProvider,
  useMobileAuthSession,
} from '@/src/auth/session-provider';
import { mobileColors } from '@/src/theme';

export default function RootLayout() {
  return (
    <MobileAuthSessionProvider>
      <StatusBar style="light" />
      <AuthRouteGate />
    </MobileAuthSessionProvider>
  );
}

function AuthRouteGate() {
  const segments = useSegments();
  const { state } = useMobileAuthSession();
  const isAuthRoute = segments[0] === 'auth';
  const routeKey = segments.join('/');
  const isSignInRoute = routeKey === 'auth/sign-in';

  if (state.status === 'loading') {
    return (
      <View
        style={{
          alignItems: 'center',
          backgroundColor: mobileColors.background,
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={mobileColors.safe} />
      </View>
    );
  }

  if (state.status !== 'signed_in' && !isAuthRoute) {
    return <Redirect href="/auth/sign-in" />;
  }

  if (state.status === 'signed_in' && isSignInRoute) {
    return <Redirect href="/(tabs)" />;
  }

  return (
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
  );
}

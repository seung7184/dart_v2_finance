import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { mobileColors } from '@/src/theme';

export default function RootLayout() {
  return (
    <>
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
      </Stack>
    </>
  );
}

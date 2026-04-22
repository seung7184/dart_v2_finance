import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0a0c10' },
          headerTintColor: '#e6edf3',
          contentStyle: { backgroundColor: '#0f1117' },
        }}
      />
    </>
  );
}

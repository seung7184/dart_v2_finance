import { Tabs } from 'expo-router';

import { mobileColors } from '@/src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: mobileColors.sidebar,
          borderTopColor: mobileColors.border,
        },
        tabBarActiveTintColor: mobileColors.safe,
        tabBarInactiveTintColor: mobileColors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home' }}
      />
    </Tabs>
  );
}

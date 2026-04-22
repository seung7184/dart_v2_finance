import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0c10',
          borderTopColor: '#21262d',
        },
        tabBarActiveTintColor: '#58a6ff',
        tabBarInactiveTintColor: '#8b949e',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home' }}
      />
    </Tabs>
  );
}

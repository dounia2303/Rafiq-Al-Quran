
import { Tabs } from 'expo-router';

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#075B46',
        tabBarInactiveTintColor: '#829087',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EAE9DF',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarLabel: 'الرئيسية',
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'القرآن الكريم',
          tabBarLabel: 'القرآن الكريم',
        }}
      />

      <Tabs.Screen
        name="statistics"
        options={{
          title: 'إحصائيات التقدم',
          tabBarLabel: 'الإحصائيات',
        }}
      />
    </Tabs>
  );
}

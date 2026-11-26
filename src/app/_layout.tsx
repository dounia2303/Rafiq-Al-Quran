
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="surah/[number]" />

      <Stack.Screen name="mushaf" />

        <Stack.Screen name="adhkar" />
        <Stack.Screen name="hadith" />
        <Stack.Screen name="asma" />
        <Stack.Screen name="prayer-times" />
        <Stack.Screen name="qibla" />
        <Stack.Screen name="mutashabihat" />
        
      </Stack>
    </ThemeProvider>
  );
}

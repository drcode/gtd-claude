import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { GTDProvider } from '@/contexts/gtd-context';
import { GTDModal } from '@/components/gtd';
import { GTDColors } from '@/constants/theme';

// Custom dark theme matching the GTD app
const GTDTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: GTDColors.background,
    card: GTDColors.backgroundSecondary,
    text: GTDColors.text,
    border: GTDColors.border,
    primary: GTDColors.cyan,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <GTDProvider>
      <ThemeProvider value={GTDTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <GTDModal />
        <StatusBar style="light" />
      </ThemeProvider>
    </GTDProvider>
  );
}

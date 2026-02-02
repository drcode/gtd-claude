import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GTDColors } from '@/constants/theme';
import { useGTD } from '@/contexts/gtd-context';
import { useIsColumnMode } from '@/hooks/use-screen-width';
import { ColumnLayout } from '@/components/gtd';

export default function TabLayout() {
  const isColumnMode = useIsColumnMode();
  const { loadState, isLoading } = useGTD();

  // For wide screens (like Samsung Fold unfolded), show column layout
  if (isColumnMode) {
    return (
      <View style={styles.container}>
        <ColumnLayout />
      </View>
    );
  }

  // For narrow screens, show tab layout
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: GTDColors.cyan,
        tabBarInactiveTintColor: GTDColors.textMuted,
        tabBarStyle: {
          backgroundColor: GTDColors.backgroundSecondary,
          borderTopColor: GTDColors.border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Next',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="checklist" color={color} />,
        }}
      />
      <Tabs.Screen
        name="gtd"
        options={{
          title: 'GTD',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="entries"
        options={{
          title: 'Entries',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="clock" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reload"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            if (!isLoading) void loadState();
          },
        }}
        options={{
          title: 'Reload',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="arrow.clockwise" color={isLoading ? GTDColors.cyan : color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GTDColors.background,
  },
});

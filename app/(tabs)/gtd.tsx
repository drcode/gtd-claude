import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GTDColors } from '@/constants/theme';
import { GTDView, StatusBar } from '@/components/gtd';

export default function GTDScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar />
      <GTDView />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GTDColors.background,
  },
});

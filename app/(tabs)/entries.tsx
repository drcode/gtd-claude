import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GTDColors } from '@/constants/theme';
import { EntriesView, StatusBar } from '@/components/gtd';

export default function EntriesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar />
      <EntriesView />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GTDColors.background,
  },
});

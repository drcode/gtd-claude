import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GTDColors } from '@/constants/theme';
import { NextActionsView, EntryInput, ActionButtons, StatusBar } from '@/components/gtd';

export default function NextActionsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar />
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.buttonsContainer}>
          <ActionButtons compact />
        </View>
        <NextActionsView />
        <EntryInput />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GTDColors.background,
  },
  content: {
    flex: 1,
  },
  buttonsContainer: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: GTDColors.border,
  },
});

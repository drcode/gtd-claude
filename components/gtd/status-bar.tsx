import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GTDColors } from '@/constants/theme';
import { useGTD } from '@/contexts/gtd-context';

export function StatusBar() {
  const { status, statusIsError } = useGTD();

  if (!status) return null;

  return (
    <View style={[styles.container, statusIsError && styles.error]}>
      <Text style={[styles.text, statusIsError && styles.errorText]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: GTDColors.statusBg,
    borderBottomWidth: 1,
    borderBottomColor: GTDColors.statusBorder,
  },
  error: {
    backgroundColor: GTDColors.errorBg,
    borderBottomColor: GTDColors.red,
  },
  text: {
    color: GTDColors.statusText,
    fontSize: 13,
  },
  errorText: {
    color: GTDColors.red,
  },
});

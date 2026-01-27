import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { GTDColors } from '@/constants/theme';
import { useGTD } from '@/contexts/gtd-context';

export function EntriesView() {
  const { userEntries } = useGTD();

  if (userEntries.length === 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.loading}>(no entries)</Text>
      </ScrollView>
    );
  }

  // Sort by timestamp descending (newest first)
  const sorted = [...userEntries].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {sorted.map((entry, i) => {
        const date = new Date(entry.timestamp * 1000);
        const dateStr = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        return (
          <View key={i} style={styles.entryItem}>
            <Text style={styles.timestamp}>{dateStr}</Text>
            <Text style={styles.entryText}>{entry.text || ''}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GTDColors.background,
  },
  content: {
    padding: 12,
  },
  loading: {
    color: GTDColors.textMuted,
    fontStyle: 'italic',
  },
  entryItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: GTDColors.border,
  },
  timestamp: {
    color: GTDColors.textMuted,
    fontSize: 12,
  },
  entryText: {
    color: GTDColors.text,
    fontSize: 14,
    lineHeight: 21,
  },
});

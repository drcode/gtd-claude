import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { GTDColors } from '@/constants/theme';
import { useGTD } from '@/contexts/gtd-context';

export function NextActionsView() {
  const { nextActions } = useGTD();

  const hasGroups = nextActions.groups && nextActions.groups.length > 0;
  const hasWaiting = nextActions.waiting && nextActions.waiting.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {hasGroups ? (
        nextActions.groups.map((group, gi) => (
          <View key={gi}>
            <Text style={styles.categoryName}>{group.name}:</Text>
            {group.items?.map((item, ii) => (
              <Text
                key={ii}
                style={[styles.naItem, item.is_ugh && styles.ugh]}
              >
                {item.text}
              </Text>
            ))}
          </View>
        ))
      ) : (
        <Text style={styles.loading}>(no next actions)</Text>
      )}

      {hasWaiting && (
        <View style={styles.waitingSection}>
          <Text style={styles.waitingHeader}>Waiting:</Text>
          {nextActions.waiting.map((item, i) => {
            let text = item.text;
            if (item.tickler_date) text += ` ${item.tickler_date}`;
            if (item.project) text += ` (${item.project})`;
            return (
              <Text key={i} style={styles.waitingItem}>
                {text}
              </Text>
            );
          })}
        </View>
      )}
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
  categoryName: {
    color: GTDColors.cyan,
    fontWeight: 'bold',
    marginTop: 8,
  },
  naItem: {
    color: GTDColors.text,
    paddingLeft: 16,
    fontSize: 14,
    lineHeight: 21,
  },
  ugh: {
    color: GTDColors.purple,
  },
  waitingSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: GTDColors.border,
    borderStyle: 'dashed',
  },
  waitingHeader: {
    color: GTDColors.textMuted,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  waitingItem: {
    color: GTDColors.textMuted,
    paddingLeft: 16,
    fontSize: 14,
    lineHeight: 21,
  },
});

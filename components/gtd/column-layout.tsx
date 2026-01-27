import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GTDColors } from '@/constants/theme';
import { GTDView } from './gtd-view';
import { NextActionsView } from './next-actions-view';
import { EntriesView } from './entries-view';
import { StatusBar } from './status-bar';
import { EntryInput } from './entry-input';
import { ActionButtons } from './action-buttons';

export function ColumnLayout() {
  return (
    <View style={styles.container}>
      {/* Left Column - GTD Data */}
      <View style={styles.column}>
        <View style={styles.columnHeader}>
          <Text style={styles.headerText}>GTD Data</Text>
        </View>
        <StatusBar />
        <GTDView />
      </View>

      {/* Middle Column - Next Actions */}
      <View style={styles.column}>
        <View style={styles.columnHeader}>
          <Text style={styles.headerText}>Next Actions</Text>
        </View>
        <EntryInput />
        <ActionButtons />
        <NextActionsView />
      </View>

      {/* Right Column - User Entries */}
      <View style={[styles.column, styles.lastColumn]}>
        <View style={styles.columnHeader}>
          <Text style={styles.headerText}>User Entries</Text>
        </View>
        <EntriesView />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: GTDColors.background,
  },
  column: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: GTDColors.border,
  },
  lastColumn: {
    borderRightWidth: 0,
  },
  columnHeader: {
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: GTDColors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: GTDColors.border,
  },
  headerText: {
    color: GTDColors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

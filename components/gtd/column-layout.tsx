import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { GTDColors } from '@/constants/theme';
import { useGTD } from '@/contexts/gtd-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GTDView } from './gtd-view';
import { NextActionsView } from './next-actions-view';
import { EntriesView } from './entries-view';
import { StatusBar } from './status-bar';
import { EntryInput } from './entry-input';
import { ActionButtons } from './action-buttons';

export function ColumnLayout() {
  const { loadState, isLoading } = useGTD();

  return (
    <View style={styles.container}>
      {/* Left Column - GTD Data */}
      <View style={styles.column}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reload"
          onPress={() => void loadState()}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.columnHeader,
            pressed && styles.columnHeaderPressed,
            isLoading && styles.disabled,
          ]}
        >
          <Text style={styles.headerText}>GTD Data</Text>
          <View style={styles.reloadIcon}>
            <IconSymbol name="arrow.clockwise" size={16} color={isLoading ? GTDColors.cyan : GTDColors.textMuted} />
          </View>
        </Pressable>
        <StatusBar />
        <GTDView />
      </View>

      {/* Middle Column - Next Actions */}
      <View style={styles.column}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reload"
          onPress={() => void loadState()}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.columnHeader,
            pressed && styles.columnHeaderPressed,
            isLoading && styles.disabled,
          ]}
        >
          <Text style={styles.headerText}>Next Actions</Text>
          <View style={styles.reloadIcon}>
            <IconSymbol name="arrow.clockwise" size={16} color={isLoading ? GTDColors.cyan : GTDColors.textMuted} />
          </View>
        </Pressable>
        <EntryInput />
        <ActionButtons />
        <NextActionsView />
      </View>

      {/* Right Column - User Entries */}
      <View style={[styles.column, styles.lastColumn]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reload"
          onPress={() => void loadState()}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.columnHeader,
            pressed && styles.columnHeaderPressed,
            isLoading && styles.disabled,
          ]}
        >
          <Text style={styles.headerText}>User Entries</Text>
          <View style={styles.reloadIcon}>
            <IconSymbol name="arrow.clockwise" size={16} color={isLoading ? GTDColors.cyan : GTDColors.textMuted} />
          </View>
        </Pressable>
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
    position: 'relative',
    justifyContent: 'center',
  },
  columnHeaderPressed: {
    backgroundColor: GTDColors.hover,
  },
  disabled: {
    opacity: 0.7,
  },
  reloadIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: GTDColors.text,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});

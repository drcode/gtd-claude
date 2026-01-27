import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GTDColors } from '@/constants/theme';
import { useGTD } from '@/contexts/gtd-context';

interface ActionButtonsProps {
  style?: object;
  compact?: boolean;
}

export function ActionButtons({ style, compact = false }: ActionButtonsProps) {
  const { doUndo, doReview, doAdvice, doCompact, isLoading } = useGTD();

  return (
    <View style={[styles.container, compact && styles.compact, style]}>
      <Pressable
        style={[styles.button, compact && styles.compactButton]}
        onPress={doUndo}
        disabled={isLoading}
      >
        <Text style={[styles.buttonText, compact && styles.compactButtonText]}>undo</Text>
      </Pressable>
      <Pressable
        style={[styles.button, compact && styles.compactButton]}
        onPress={doReview}
        disabled={isLoading}
      >
        <Text style={[styles.buttonText, compact && styles.compactButtonText]}>review</Text>
      </Pressable>
      <Pressable
        style={[styles.button, compact && styles.compactButton]}
        onPress={doAdvice}
        disabled={isLoading}
      >
        <Text style={[styles.buttonText, compact && styles.compactButtonText]}>advice</Text>
      </Pressable>
      <Pressable
        style={[styles.button, compact && styles.compactButton]}
        onPress={doCompact}
        disabled={isLoading}
      >
        <Text style={[styles.buttonText, compact && styles.compactButtonText]}>compact</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: GTDColors.border,
  },
  compact: {
    flexWrap: 'wrap',
    marginBottom: 8,
    borderBottomWidth: 0,
    padding: 0,
    gap: 6,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: GTDColors.backgroundSecondary,
    borderWidth: 1,
    borderColor: GTDColors.border,
  },
  compactButton: {
    flex: 1,
    minWidth: 60,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: GTDColors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  compactButtonText: {
    fontSize: 12,
  },
});

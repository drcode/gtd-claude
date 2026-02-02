import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GTDColors } from '@/constants/theme';
import { useGTD } from '@/contexts/gtd-context';

const MAX_SHIMMERED = 3;
const STORAGE_KEY = '@gtd_shimmered_items';

function MarqueeText({ text, isUgh, isShimmered }: {
  text: string;
  isUgh?: boolean;
  isShimmered: boolean;
}) {
  const [highlightIndex, setHighlightIndex] = useState(-1);

  useEffect(() => {
    if (isShimmered) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        setHighlightIndex(currentIndex);
        currentIndex = (currentIndex + 1) % (text.length + 4);
      }, 53);
      return () => clearInterval(interval);
    } else {
      setHighlightIndex(-1);
    }
  }, [isShimmered, text.length]);

  if (!isShimmered) {
    return (
      <Text style={[styles.naItem, isUgh && styles.ugh]}>
        {text}
      </Text>
    );
  }

  const baseColor = isUgh ? GTDColors.purple : GTDColors.text;
  // Three wave positions, spaced apart
  const waveSpacing = Math.max(8, Math.floor(text.length / 3));
  const wave1 = highlightIndex;
  const wave2 = (highlightIndex + waveSpacing) % (text.length + 4);
  const wave3 = (highlightIndex + waveSpacing * 2) % (text.length + 4);

  return (
    <Text style={styles.naItem}>
      {text.split('').map((char, i) => {
        const dist1 = Math.abs(i - wave1);
        const dist2 = Math.abs(i - wave2);
        const dist3 = Math.abs(i - wave3);
        const minDist = Math.min(dist1, dist2, dist3);

        let color = baseColor;
        if (minDist === 0) {
          color = isUgh ? '#ff88ff' : '#b0deff';
        } else if (minDist === 1) {
          color = isUgh ? '#e070e0' : '#a8d4f4';
        } else if (minDist === 2) {
          color = isUgh ? '#d060d0' : '#9dcaea';
        }
        return (
          <Text key={i} style={{ color }}>
            {char}
          </Text>
        );
      })}
    </Text>
  );
}

function ShimmerItem({ text, isUgh, isShimmered, onPress, disabled }: {
  text: string;
  isUgh?: boolean;
  isShimmered: boolean;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled && !isShimmered}>
      <View style={styles.itemContainer}>
        <MarqueeText text={text} isUgh={isUgh} isShimmered={isShimmered} />
      </View>
    </Pressable>
  );
}

export function NextActionsView() {
  const { nextActions } = useGTD();
  const [shimmeredItems, setShimmeredItems] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Load shimmered items from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(value => {
        if (value) {
          const items = JSON.parse(value) as string[];
          setShimmeredItems(new Set(items));
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Save shimmered items to storage when they change
  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...shimmeredItems]));
    }
  }, [shimmeredItems, loaded]);

  // Clean up shimmered items that are no longer in the list
  // Only run cleanup when we have actual data from server
  useEffect(() => {
    if (!loaded) return;
    if (!nextActions.groups || nextActions.groups.length === 0) return;

    const allItemTexts = new Set<string>();
    nextActions.groups.forEach(group => {
      group.items?.forEach(item => {
        allItemTexts.add(item.text);
      });
    });

    // Only clean up if we have items to check against
    if (allItemTexts.size === 0) return;

    setShimmeredItems(prev => {
      const updated = new Set<string>();
      prev.forEach(text => {
        if (allItemTexts.has(text)) {
          updated.add(text);
        }
      });
      if (updated.size !== prev.size) {
        return updated;
      }
      return prev;
    });
  }, [nextActions, loaded]);

  const toggleShimmer = (text: string) => {
    setShimmeredItems(prev => {
      const updated = new Set(prev);
      if (updated.has(text)) {
        updated.delete(text);
      } else if (updated.size < MAX_SHIMMERED) {
        updated.add(text);
      }
      // Save immediately to ensure persistence
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...updated]));
      return updated;
    });
  };

  const hasGroups = nextActions.groups && nextActions.groups.length > 0;
  const hasWaiting = nextActions.waiting && nextActions.waiting.length > 0;
  const atLimit = shimmeredItems.size >= MAX_SHIMMERED;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {hasGroups ? (
        nextActions.groups.map((group, gi) => (
          <View key={gi}>
            <Text style={styles.categoryName}>{group.name}:</Text>
            {group.items?.map((item, ii) => (
              <ShimmerItem
                key={ii}
                text={item.text}
                isUgh={item.is_ugh}
                isShimmered={shimmeredItems.has(item.text)}
                onPress={() => toggleShimmer(item.text)}
                disabled={atLimit}
              />
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
  itemContainer: {
    marginVertical: 1,
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

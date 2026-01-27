import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { GTDColors } from '@/constants/theme';
import { useGTD } from '@/contexts/gtd-context';

interface EntryInputProps {
  style?: object;
}

export function EntryInput({ style }: EntryInputProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitEntry } = useGTD();

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const entryText = text;
    setText('');

    try {
      await submitEntry(entryText);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Enter new item..."
        placeholderTextColor={GTDColors.textMuted}
        editable={!isSubmitting}
        onSubmitEditing={handleSubmit}
        returnKeyType="send"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: GTDColors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: GTDColors.border,
  },
  input: {
    backgroundColor: GTDColors.background,
    color: GTDColors.text,
    borderWidth: 1,
    borderColor: GTDColors.border,
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
});

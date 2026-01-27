import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { GTDColors } from '@/constants/theme';
import { useGTD } from '@/contexts/gtd-context';

export function GTDView() {
  const { gtdText, diffLines, clearDiff } = useGTD();
  const [notesExpanded, setNotesExpanded] = useState(false);

  if (diffLines && diffLines.length > 0) {
    return <DiffView diffLines={diffLines} onClear={clearDiff} />;
  }

  // Parse the GTD text to separate notes
  const lines = gtdText.split('\n');
  const mainLines: string[] = [];
  const notesLines: string[] = [];
  let inNotes = false;

  for (const line of lines) {
    if (line === 'notes') {
      inNotes = true;
    } else if (inNotes) {
      notesLines.push(line);
    } else {
      mainLines.push(line);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.text}>{mainLines.join('\n')}</Text>
      {notesLines.length > 0 && (
        <>
          <Pressable onPress={() => setNotesExpanded(!notesExpanded)}>
            <Text style={styles.notesToggle}>
              notes[{notesExpanded ? '-' : '+'}]
            </Text>
          </Pressable>
          {notesExpanded && (
            <Text style={styles.text}>{notesLines.join('\n')}</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

function DiffView({ diffLines, onClear }: { diffLines: { text: string; type: string }[]; onClear: () => void }) {
  const [notesExpanded, setNotesExpanded] = useState(false);

  // Separate main lines from notes
  const mainLines: typeof diffLines = [];
  const notesLines: typeof diffLines = [];
  let inNotes = false;

  for (const line of diffLines) {
    if (line.text === 'notes' || line.text.match(/^notes$/)) {
      inNotes = true;
      notesLines.push(line);
    } else if (inNotes) {
      notesLines.push(line);
    } else {
      mainLines.push(line);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={onClear}>
        <Text style={styles.clearHint}>(tap to clear diff)</Text>
      </Pressable>
      {mainLines.map((line, i) => (
        <Text
          key={i}
          style={[
            styles.diffLine,
            line.type === 'delete' && styles.delete,
            line.type === 'insert' && styles.insert,
          ]}
        >
          {line.text}
        </Text>
      ))}
      {notesLines.length > 0 && (
        <>
          <Pressable onPress={() => setNotesExpanded(!notesExpanded)}>
            <Text style={styles.notesToggle}>
              notes[{notesExpanded ? '-' : '+'}]
            </Text>
          </Pressable>
          {notesExpanded && notesLines.slice(1).map((line, i) => (
            <Text
              key={`notes-${i}`}
              style={[
                styles.diffLine,
                line.type === 'delete' && styles.delete,
                line.type === 'insert' && styles.insert,
              ]}
            >
              {line.text}
            </Text>
          ))}
        </>
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
  text: {
    color: GTDColors.text,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'monospace',
  },
  diffLine: {
    color: GTDColors.text,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'monospace',
  },
  delete: {
    color: GTDColors.red,
  },
  insert: {
    color: GTDColors.green,
  },
  notesToggle: {
    color: GTDColors.textMuted,
    marginTop: 8,
    fontSize: 14,
  },
  clearHint: {
    color: GTDColors.textMuted,
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
});

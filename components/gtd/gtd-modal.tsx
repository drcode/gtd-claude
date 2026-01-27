import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Modal } from 'react-native';
import { GTDColors } from '@/constants/theme';
import { useGTD } from '@/contexts/gtd-context';

export function GTDModal() {
  const {
    modalVisible,
    modalTitle,
    modalContent,
    modalShowApply,
    closeModal,
    applyModalAction,
  } = useGTD();

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <Pressable style={styles.overlay} onPress={closeModal}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.header}>{modalTitle}</Text>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.content}>{modalContent}</Text>
          </ScrollView>
          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={closeModal}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
            {modalShowApply && (
              <Pressable style={styles.button} onPress={applyModalAction}>
                <Text style={styles.buttonText}>Apply</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: GTDColors.backgroundSecondary,
    borderWidth: 1,
    borderColor: GTDColors.border,
    padding: 20,
    maxWidth: '90%',
    maxHeight: '80%',
    width: 500,
  },
  header: {
    color: GTDColors.text,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  scrollView: {
    flexGrow: 0,
    maxHeight: 400,
  },
  contentContainer: {
    paddingBottom: 8,
  },
  content: {
    color: GTDColors.text,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: GTDColors.backgroundSecondary,
    borderWidth: 1,
    borderColor: GTDColors.border,
  },
  buttonText: {
    color: GTDColors.text,
    fontSize: 13,
    fontWeight: '500',
  },
});

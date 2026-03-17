import React from 'react';
import {
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  View,
} from 'react-native';
import { colors, fonts, fontSizes } from '../theme';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  body: string;
  closeLabel: string;
}

export default function InfoModal({
  visible,
  onClose,
  title,
  body,
  closeLabel,
}: InfoModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <Text selectable style={styles.body}>{body}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.gotItButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.gotItText}>{closeLabel}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderCurve: 'continuous',
    padding: 24,
    width: '100%',
    maxWidth: 360,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: fontSizes.sm * 1.7,
    marginBottom: 20,
  },
  buttonRow: {
    alignItems: 'flex-end',
  },
  gotItButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  gotItText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.primary,
  },
});

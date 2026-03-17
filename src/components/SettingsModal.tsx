import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, fonts, fontSizes } from '../theme';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  icon: LucideIcon;
  title: string;
  description?: string;
  saveLabel: string;
  cancelLabel: string;
  saveIcon?: React.ReactNode;
  children: React.ReactNode;
}

export default function SettingsModal({
  visible,
  onClose,
  onSave,
  icon: Icon,
  title,
  description,
  saveLabel,
  cancelLabel,
  saveIcon,
  children,
}: SettingsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={() => {}}>
          <View style={styles.iconWrap}>
            <Icon size={28} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
          {children}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={onSave}
            activeOpacity={0.8}
          >
            {saveIcon}
            <Text style={styles.saveButtonText}>{saveLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
          </TouchableOpacity>
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
    borderRadius: 24,
    borderCurve: 'continuous',
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSizes.sm * 1.6,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    borderCurve: 'continuous',
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 10,
    boxShadow: '0 2px 8px ' + colors.primary + '30',
  },
  saveButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textOnPrimary,
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  cancelButtonText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
});

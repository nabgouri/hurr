import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Smartphone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, fontSizes } from '../theme';

interface ConfirmBlockModalProps {
  visible: boolean;
  appName: string;
  appIcon: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmBlockModal({
  visible,
  appName,
  appIcon,
  onCancel,
  onConfirm,
}: ConfirmBlockModalProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.content} onPress={() => {}}>
          <View style={styles.iconContainer}>
            {appIcon ? (
              <Image
                source={{ uri: `data:image/png;base64,${appIcon}` }}
                style={styles.appIcon}
              />
            ) : (
              <Smartphone size={32} color={colors.primary} strokeWidth={1.5} />
            )}
          </View>
          <Text style={styles.title}>
            {t('blocklist.confirmBlockTitle', { appName })}
          </Text>
          <Text style={styles.message}>
            {t('blocklist.confirmBlockMessage', { appName })}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.blockButton}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.blockText}>{t('blocklist.block')}</Text>
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
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: fontSizes.sm * 1.6,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  blockButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.blocked,
    alignItems: 'center',
  },
  blockText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.white,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Smartphone, Globe } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, fontSizes } from '../theme';
import BottomSheet from './BottomSheet';

interface ActionPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onBlockApp: () => void;
  onBlockKeyword: () => void;
}

export default function ActionPickerSheet({
  visible,
  onClose,
  onBlockApp,
  onBlockKeyword,
}: ActionPickerSheetProps) {
  const { t } = useTranslation();

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onBlockApp}
          activeOpacity={0.7}
        >
          <Smartphone size={24} color={colors.blocked} strokeWidth={2} />
          <Text style={styles.actionText}>{t('blocklist.blockApp')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onBlockKeyword}
          activeOpacity={0.7}
        >
          <Globe size={24} color={colors.blocked} strokeWidth={2} />
          <Text style={styles.actionText}>
            {t('blocklist.blockKeywordOrWebsite')}
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.blocked,
    backgroundColor: colors.blockedBackground,
  },
  actionText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.blocked,
    flex: 1,
  },
});

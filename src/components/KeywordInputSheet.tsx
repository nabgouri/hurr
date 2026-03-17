import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, fontSizes } from '../theme';
import BottomSheet from './BottomSheet';

interface KeywordInputSheetProps {
  visible: boolean;
  onClose: () => void;
  onBlock: (keyword: string) => void;
}

export default function KeywordInputSheet({
  visible,
  onClose,
  onBlock,
}: KeywordInputSheetProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');

  const handleBlock = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onBlock(trimmed);
    setInput('');
  };

  const handleClose = () => {
    setInput('');
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title={t('blocklist.blockKeywordOrWebsite')}
    >
      <View style={styles.container}>
        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>{t('blocklist.keywordExamples')}</Text>
        <Text style={styles.exampleText}>{t('blocklist.keywordExample1')}</Text>
        <Text style={styles.exampleText}>{t('blocklist.keywordExample2')}</Text>

        <Text style={[styles.sectionTitle, styles.sectionSpacing]}>
          {t('blocklist.websiteExamples')}
        </Text>
        <Text style={styles.exampleText}>{t('blocklist.websiteExample1')}</Text>
        <Text style={styles.exampleText}>{t('blocklist.websiteExample2')}</Text>

        <Text style={styles.noteText}>
          <Text style={styles.noteBold}>{t('blocklist.note')} </Text>
          {t('blocklist.keywordNote')}
        </Text>

        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={t('blocklist.enterKeywordOrWebsite')}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.blockButton, !input.trim() && styles.blockButtonDisabled]}
          onPress={handleBlock}
          activeOpacity={0.8}
          disabled={!input.trim()}
        >
          <Text style={styles.blockButtonText}>{t('blocklist.block')}</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSpacing: {
    marginTop: 16,
  },
  exampleText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: fontSizes.sm * 1.6,
    paddingLeft: 4,
  },
  noteText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: fontSizes.sm * 1.6,
    marginTop: 16,
    marginBottom: 20,
  },
  noteBold: {
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: 14,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    marginBottom: 16,
  },
  blockButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    borderCurve: 'continuous',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockButtonDisabled: {
    opacity: 0.5,
  },
  blockButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textOnPrimary,
  },
});

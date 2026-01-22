import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, fontSizes, globalStyles } from '../theme';

type PartnerType = 'self' | 'friend' | 'parent';
type TimeDelay = '24' | '48' | '72';

interface OptionCardProps {
  emoji: string;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}

const OptionCard = ({ emoji, title, description, selected, onPress }: OptionCardProps) => (
  <TouchableOpacity
    style={[styles.optionCard, selected && styles.optionCardSelected]}
    onPress={onPress}
  >
    <Text style={styles.optionEmoji}>{emoji}</Text>
    <View style={styles.optionTextContainer}>
      <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>{title}</Text>
      <Text style={styles.optionDescription}>{description}</Text>
    </View>
    <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
  </TouchableOpacity>
);

export default function PartnerSetupScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [partnerType, setPartnerType] = useState<PartnerType>('self');
  const [timeDelay, setTimeDelay] = useState<TimeDelay>('24');
  const [partnerEmail, setPartnerEmail] = useState('');

  const handleSave = () => {
    // Save partner settings
    navigation.goBack();
  };

  return (
    <SafeAreaView style={globalStyles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.title}>{t('partner.title')}</Text>
        <Text style={styles.subtitle}>{t('partner.description')}</Text>

        {/* Partner Type Selection */}
        <Text style={styles.sectionTitle}>{t('settings.partnerType')}</Text>

        <OptionCard
          emoji="👤"
          title={t('settings.self')}
          description={t('partner.selfDescription')}
          selected={partnerType === 'self'}
          onPress={() => setPartnerType('self')}
        />

        <OptionCard
          emoji="👫"
          title={t('settings.friend')}
          description={t('partner.partnerDescription')}
          selected={partnerType === 'friend'}
          onPress={() => setPartnerType('friend')}
        />

        <OptionCard
          emoji="👨‍👩‍👧"
          title={t('settings.parent')}
          description={t('partner.partnerDescription')}
          selected={partnerType === 'parent'}
          onPress={() => setPartnerType('parent')}
        />

        {/* Time Delay Selection (for self) */}
        {partnerType === 'self' && (
          <>
            <Text style={styles.sectionTitle}>{t('settings.timeDelay')}</Text>
            <View style={styles.delayContainer}>
              {(['24', '48', '72'] as TimeDelay[]).map((delay) => (
                <TouchableOpacity
                  key={delay}
                  style={[
                    styles.delayButton,
                    timeDelay === delay && styles.delayButtonSelected,
                  ]}
                  onPress={() => setTimeDelay(delay)}
                >
                  <Text
                    style={[
                      styles.delayButtonText,
                      timeDelay === delay && styles.delayButtonTextSelected,
                    ]}
                  >
                    {t(`settings.hours${delay}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Partner Email (for friend/parent) */}
        {partnerType !== 'self' && (
          <>
            <Text style={styles.sectionTitle}>{t('partner.enterEmail')}</Text>
            <TextInput
              style={styles.emailInput}
              placeholder={t('partner.enterEmail')}
              placeholderTextColor={colors.textMuted}
              value={partnerEmail}
              onChangeText={setPartnerEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </>
        )}

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {partnerType === 'self' ? t('common.save') : t('partner.sendInvite')}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: 12,
    marginTop: 8,
  },
  optionCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.protectedBackground,
  },
  optionEmoji: {
    fontSize: 32,
    marginLeft: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  optionTitleSelected: {
    color: colors.primary,
  },
  optionDescription: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  delayContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  delayButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  delayButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.protectedBackground,
  },
  delayButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  delayButtonTextSelected: {
    color: colors.primary,
  },
  emailInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.lg,
    color: colors.textOnPrimary,
  },
  bottomPadding: {
    height: 40,
  },
});

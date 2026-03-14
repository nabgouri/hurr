import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Accessibility, Square, CheckSquare } from 'lucide-react-native';
import { colors, fonts, fontSizes } from '../theme';
import { RootStackParamList } from '../navigation/types';
import { AppBlocker } from '../modules';
import { useOnAppActive } from '../contexts/AppStateContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PermissionSetupScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [agreed, setAgreed] = useState(false);
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);

  const checkAccessibility = useCallback(async () => {
    const enabled = await AppBlocker.isAccessibilityServiceEnabled();
    setIsAccessibilityEnabled(enabled);
    if (enabled) {
      navigation.replace('MainTabs');
    }
  }, [navigation]);

  useEffect(() => {
    checkAccessibility();
  }, [checkAccessibility]);

  useOnAppActive(checkAccessibility);

  const handleTurnOn = async () => {
    await AppBlocker.openAccessibilitySettings();
  };

  const handleSkip = () => {
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header icon */}
        <View style={styles.header}>
          <Accessibility size={56} color={colors.primary} strokeWidth={1.5} />
          <Text style={styles.title}>{t('onboarding.accessibilityTitle')}</Text>
        </View>

        {/* Usage section */}
        <Text style={styles.sectionTitle}>{t('onboarding.accessibilityUsage')}</Text>

        {/* Point 1 */}
        <View style={styles.point}>
          <View style={styles.bullet} />
          <Text style={styles.pointText}>{t('onboarding.accessibilityPoint1')}</Text>
        </View>

        {/* Point 2 */}
        <View style={styles.point}>
          <View style={styles.bullet} />
          <Text style={styles.pointText}>{t('onboarding.accessibilityPoint2')}</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Checkbox agreement */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.7}
        >
          {agreed ? (
            <CheckSquare size={24} color={colors.primary} strokeWidth={2} />
          ) : (
            <Square size={24} color={colors.textMuted} strokeWidth={2} />
          )}
          <Text style={styles.checkboxText}>{t('onboarding.accessibilityCheckbox')}</Text>
        </TouchableOpacity>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>{t('onboarding.skip')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.turnOnButton, !agreed && styles.turnOnButtonDisabled]}
            onPress={handleTurnOn}
            disabled={!agreed}
          >
            <Text
              style={[styles.turnOnButtonText, !agreed && styles.turnOnButtonTextDisabled]}
            >
              {t('onboarding.turnOn')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 12,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textPrimary,
    marginTop: 8,
  },
  pointText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    lineHeight: fontSizes.md * 1.6,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  checkboxText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: fontSizes.sm * 1.5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.textMuted,
  },
  skipButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  turnOnButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  turnOnButtonDisabled: {
    backgroundColor: colors.border,
  },
  turnOnButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textOnPrimary,
  },
  turnOnButtonTextDisabled: {
    color: colors.textMuted,
  },
});

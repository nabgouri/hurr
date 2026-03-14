import React from 'react';
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
import { ShieldCheck, Lock, Eye, UserCheck } from 'lucide-react-native';
import { colors, fonts, fontSizes } from '../theme';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const handleAgree = () => {
    navigation.replace('PermissionSetup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with icon + app name */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <ShieldCheck size={48} color={colors.primary} strokeWidth={1.5} />
          </View>
          <Text style={styles.appName}>{t('app.name')}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{t('onboarding.privacyTitle')}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>{t('onboarding.privacySubtitle')}</Text>

        {/* Privacy Points */}
        <View style={styles.pointsContainer}>
          <View style={styles.point}>
            <View style={styles.pointIconContainer}>
              <Lock size={20} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.pointText}>{t('onboarding.privacyPoint1')}</Text>
          </View>

          <View style={styles.point}>
            <View style={styles.pointIconContainer}>
              <Eye size={20} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.pointText}>{t('onboarding.privacyPoint2')}</Text>
          </View>

          <View style={styles.point}>
            <View style={styles.pointIconContainer}>
              <UserCheck size={20} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.pointText}>{t('onboarding.privacyPoint3')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.agreeText}>
          {t('onboarding.privacyAgree')}{' '}
          <Text style={styles.linkText}>{t('onboarding.termsAndPrivacy')}</Text>
        </Text>

        <TouchableOpacity style={styles.agreeButton} onPress={handleAgree}>
          <Text style={styles.agreeButtonText}>{t('onboarding.agreeAndContinue')}</Text>
        </TouchableOpacity>
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
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appName: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: fontSizes.md * 1.6,
    marginBottom: 24,
  },
  pointsContainer: {
    gap: 20,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  pointIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
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
  agreeText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  linkText: {
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  agreeButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  agreeButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.lg,
    color: colors.textOnPrimary,
  },
});

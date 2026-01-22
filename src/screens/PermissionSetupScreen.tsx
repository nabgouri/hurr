import React, { useState } from 'react';
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
import { colors, fonts, fontSizes } from '../theme';

interface Permission {
  id: string;
  emoji: string;
  titleKey: string;
  descriptionKey: string;
  granted: boolean;
}

const initialPermissions: Permission[] = [
  {
    id: 'usage',
    emoji: '📊',
    titleKey: 'onboarding.usageAccess',
    descriptionKey: 'onboarding.usageAccessDescription',
    granted: false,
  },
  {
    id: 'overlay',
    emoji: '🖼️',
    titleKey: 'onboarding.overlayPermission',
    descriptionKey: 'onboarding.overlayPermissionDescription',
    granted: false,
  },
  {
    id: 'accessibility',
    emoji: '♿',
    titleKey: 'onboarding.accessibilityService',
    descriptionKey: 'onboarding.accessibilityServiceDescription',
    granted: false,
  },
  {
    id: 'vpn',
    emoji: '🔒',
    titleKey: 'onboarding.vpnPermission',
    descriptionKey: 'onboarding.vpnPermissionDescription',
    granted: false,
  },
];

export default function PermissionSetupScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);

  const handleGrantPermission = (permissionId: string) => {
    // In real app, this would open the appropriate settings
    // For now, just simulate granting
    setPermissions((prev) =>
      prev.map((p) =>
        p.id === permissionId ? { ...p, granted: true } : p
      )
    );
  };

  const allGranted = permissions.every((p) => p.granted);

  const handleFinish = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🔐</Text>
          <Text style={styles.title}>{t('onboarding.permissions')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.permissionsDescription')}</Text>
        </View>

        {/* Permissions List */}
        <View style={styles.permissionsList}>
          {permissions.map((permission) => (
            <View
              key={permission.id}
              style={[
                styles.permissionCard,
                permission.granted && styles.permissionCardGranted,
              ]}
            >
              <View style={styles.permissionContent}>
                <Text style={styles.permissionEmoji}>{permission.emoji}</Text>
                <View style={styles.permissionTextContainer}>
                  <Text style={styles.permissionTitle}>
                    {t(permission.titleKey)}
                  </Text>
                  <Text style={styles.permissionDescription}>
                    {t(permission.descriptionKey)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.grantButton,
                  permission.granted && styles.grantButtonGranted,
                ]}
                onPress={() => handleGrantPermission(permission.id)}
                disabled={permission.granted}
              >
                <Text
                  style={[
                    styles.grantButtonText,
                    permission.granted && styles.grantButtonTextGranted,
                  ]}
                >
                  {permission.granted ? '✓' : t('onboarding.grantPermission')}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.finishButton, !allGranted && styles.finishButtonDisabled]}
          onPress={handleFinish}
        >
          <Text
            style={[
              styles.finishButtonText,
              !allGranted && styles.finishButtonTextDisabled,
            ]}
          >
            {t('onboarding.finish')}
          </Text>
        </TouchableOpacity>
        {!allGranted && (
          <TouchableOpacity onPress={handleFinish}>
            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  permissionsList: {
    gap: 12,
  },
  permissionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 12,
  },
  permissionCardGranted: {
    borderColor: colors.protected,
    backgroundColor: colors.protectedBackground,
  },
  permissionContent: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  permissionEmoji: {
    fontSize: 32,
    marginLeft: 12,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: 4,
  },
  permissionDescription: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'right',
    lineHeight: fontSizes.sm * 1.5,
  },
  grantButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  grantButtonGranted: {
    backgroundColor: colors.protected,
  },
  grantButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textOnPrimary,
  },
  grantButtonTextGranted: {
    color: colors.white,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  finishButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  finishButtonDisabled: {
    backgroundColor: colors.border,
  },
  finishButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.lg,
    color: colors.textOnPrimary,
  },
  finishButtonTextDisabled: {
    color: colors.textMuted,
  },
  skipText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

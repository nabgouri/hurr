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
import {
  Settings,
  User,
  RefreshCw,
  Trash2,
  LogOut,
  Shield,
  Download,
  Star,
  HeadphonesIcon,
  ChevronLeft,
} from 'lucide-react-native';
import { colors, fonts, fontSizes, globalStyles } from '../theme';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

const SettingItem = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  danger = false,
}: SettingItemProps) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.settingItemContent}>
      <View style={[styles.settingIconContainer, danger && styles.settingIconContainerDanger]}>
        {icon}
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {showChevron && onPress && (
      <ChevronLeft size={20} color={colors.textMuted} strokeWidth={2} />
    )}
  </TouchableOpacity>
);

// Social media icon component
const SocialIcon = ({
  icon,
  onPress,
  bgColor,
}: {
  icon: React.ReactNode;
  onPress: () => void;
  bgColor: string;
}) => (
  <TouchableOpacity
    style={[styles.socialIconContainer, { backgroundColor: bgColor }]}
    onPress={onPress}
  >
    {icon}
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Settings size={28} color={colors.primary} strokeWidth={1.5} />
            <Text style={styles.title}>{t('settings.title')}</Text>
          </View>

          {/* Settings List */}
          <View style={styles.settingsList}>
            <SettingItem
              icon={<User size={22} color={colors.primary} strokeWidth={1.5} />}
              title={t('settings.account')}
              onPress={() => {}}
            />
            <SettingItem
              icon={<RefreshCw size={22} color={colors.secondary} strokeWidth={1.5} />}
              title={t('settings.updateSettings')}
              onPress={() => {}}
            />
            <SettingItem
              icon={<Trash2 size={22} color={colors.error} strokeWidth={1.5} />}
              title={t('settings.uninstallApp')}
              onPress={() => {}}
              danger
            />
            <SettingItem
              icon={<LogOut size={22} color={colors.warning} strokeWidth={1.5} />}
              title={t('settings.logOut')}
              onPress={() => {}}
            />
            <SettingItem
              icon={<Shield size={22} color={colors.info} strokeWidth={1.5} />}
              title={t('settings.privacyPolicy')}
              onPress={() => {}}
            />
            <SettingItem
              icon={<Download size={22} color={colors.success} strokeWidth={1.5} />}
              title={t('settings.checkUpdate')}
              subtitle="1.0.0"
              onPress={() => {}}
            />
            <SettingItem
              icon={<Star size={22} color={colors.accent} strokeWidth={1.5} />}
              title={t('settings.rateApp')}
              onPress={() => {}}
            />
          </View>

          {/* Social Media Section */}
          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>{t('settings.followUs')}</Text>
            <View style={styles.socialIconsRow}>
              <SocialIcon
                icon={<YoutubeIcon />}
                bgColor="#FF0000"
                onPress={() => {}}
              />
              <SocialIcon
                icon={<WhatsappIcon />}
                bgColor="#25D366"
                onPress={() => {}}
              />
              <SocialIcon
                icon={<TelegramIcon />}
                bgColor="#0088CC"
                onPress={() => {}}
              />
              <SocialIcon
                icon={<InstagramIcon />}
                bgColor="#E1306C"
                onPress={() => {}}
              />
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Support FAB */}
        <TouchableOpacity style={styles.fab} onPress={() => {}}>
          <HeadphonesIcon size={24} color={colors.white} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Custom social media icons (simplified versions)
const YoutubeIcon = () => (
  <View style={styles.socialIconInner}>
    <View style={[styles.playButton, { borderLeftColor: colors.white }]} />
  </View>
);

const WhatsappIcon = () => (
  <Text style={styles.socialIconText}>W</Text>
);

const TelegramIcon = () => (
  <Text style={styles.socialIconText}>T</Text>
);

const InstagramIcon = () => (
  <View style={styles.instagramInner}>
    <View style={styles.instagramDot} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
  },
  settingsList: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingIconContainerDanger: {
    backgroundColor: colors.blockedBackground,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  settingTitleDanger: {
    color: colors.error,
  },
  settingSubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  socialSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  socialTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textMuted,
    marginBottom: 16,
  },
  socialIconsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  socialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialIconInner: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
  socialIconText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.lg,
    color: colors.white,
  },
  instagramInner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instagramDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomPadding: {
    height: 100,
  },
});

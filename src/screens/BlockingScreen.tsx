import React, { useState, useEffect, useCallback } from 'react';
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
import {
  Ban,
  Shield,
  ShieldCheck,
  Lock,
  Clock,
  SquarePen,
} from 'lucide-react-native';
import { colors, fonts, fontSizes, globalStyles } from '../theme';
import SectionCard from '../components/SectionCard';
import ToggleItem from '../components/ToggleItem';
import EditableItem from '../components/EditableItem';
import SettingsModal from '../components/SettingsModal';
import InfoModal from '../components/InfoModal';
import { AppBlocker, DeviceAdmin } from '../modules';
import { useOnAppActive } from '../contexts/AppStateContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROTECTION_END_KEY = 'uninstall_protection_end';
const PROTECTION_DAYS_KEY = 'uninstall_protection_days';

const DAY_OPTIONS = [7, 14, 30, 60, 90] as const;
const COUNTDOWN_OPTIONS = [3, 5, 7, 10, 15, 20, 25, 30, 40, 50, 60, 120, 240, 300];

export default function BlockingScreen() {
  const { t } = useTranslation();

  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Uninstall protection state
  const [isDeviceAdminActive, setIsDeviceAdminActive] = useState(false);
  const [protectionEndDate, setProtectionEndDate] = useState<number | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [showDaysModal, setShowDaysModal] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number>(30);

  // Customize blocked screen state
  const [blockedScreenMessage, setBlockedScreenMessage] = useState<string | null>(null);
  const [blockedScreenCountdown, setBlockedScreenCountdown] = useState(3);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [tempMessage, setTempMessage] = useState('');
  const [tempCountdown, setTempCountdown] = useState(3);
  const [tempRedirectUrl, setTempRedirectUrl] = useState('');

  // Info modal state
  const [infoContent, setInfoContent] = useState<{ title: string; body: string } | null>(null);

  const showInfo = (titleKey: string, bodyKey: string) => {
    setInfoContent({ title: t(titleKey), body: t(bodyKey) });
  };

  // Placeholder states (future features)
  const [imageVideoSearchBlocked, setImageVideoSearchBlocked] = useState(false);
  const [facebookReelsBlocked, setFacebookReelsBlocked] = useState(false);
  const [youtubeShortsBlocked, setYoutubeShortsBlocked] = useState(false);
  const [whatsappChannelsBlocked, setWhatsappChannelsBlocked] = useState(false);
  const [telegramSearchBlocked, setTelegramSearchBlocked] = useState(false);
  const [blockUnsupportedBrowsers, setBlockUnsupportedBrowsers] = useState(false);
  const [blockNewlyInstalledApps, setBlockNewlyInstalledApps] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const enabled = await AppBlocker.isAccessibilityServiceEnabled();
      setIsAccessibilityEnabled(enabled);

      // Check device admin status
      const adminActive = await DeviceAdmin.isDeviceAdminActive();
      setIsDeviceAdminActive(adminActive);

      // Load blocked screen customization (parallel)
      const [savedMessage, savedCountdown, savedRedirectUrl, savedBlockUnsupported] = await Promise.all([
        AppBlocker.getBlockedScreenMessage(),
        AppBlocker.getBlockedScreenCountdown(),
        AppBlocker.getRedirectUrl(),
        AppBlocker.getBlockUnsupportedBrowsers(),
      ]);
      setBlockedScreenMessage(savedMessage);
      setBlockedScreenCountdown(savedCountdown);
      setRedirectUrl(savedRedirectUrl);
      setBlockUnsupportedBrowsers(savedBlockUnsupported);

      // Load protection end date
      const endStr = await AsyncStorage.getItem(PROTECTION_END_KEY);
      if (endStr) {
        const endDate = parseInt(endStr, 10);
        setProtectionEndDate(endDate);
        const remaining = Math.max(0, Math.ceil((endDate - Date.now()) / (1000 * 60 * 60 * 24)));
        setDaysRemaining(remaining);

        // If expired, auto-remove device admin
        if (remaining <= 0 && adminActive) {
          await clearProtectionState();
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useOnAppActive(checkStatus);

  const clearProtectionState = async () => {
    await DeviceAdmin.removeDeviceAdmin();
    setIsDeviceAdminActive(false);
    await AsyncStorage.removeItem(PROTECTION_END_KEY);
    await AsyncStorage.removeItem(PROTECTION_DAYS_KEY);
    setProtectionEndDate(null);
    setDaysRemaining(0);
  };

  const handleAdultContentToggle = async () => {
    await AppBlocker.openAccessibilitySettings();
  };

  const handleBlockUnsupportedBrowsersToggle = async (value: boolean) => {
    setBlockUnsupportedBrowsers(value);
    await AppBlocker.setBlockUnsupportedBrowsers(value);
  };

  const handleUninstallProtectionToggle = async (value: boolean) => {
    if (value) {
      setSelectedDays(30);
      setShowDaysModal(true);
    } else {
      await clearProtectionState();
    }
  };

  const handleActivateProtection = async () => {
    setShowDaysModal(false);

    const granted = await DeviceAdmin.requestDeviceAdmin();
    if (granted) {
      const endDate = Date.now() + selectedDays * 24 * 60 * 60 * 1000;
      await AsyncStorage.setItem(PROTECTION_END_KEY, endDate.toString());
      await AsyncStorage.setItem(PROTECTION_DAYS_KEY, selectedDays.toString());
      await AppBlocker.setUninstallProtectionEnd(endDate);
      setProtectionEndDate(endDate);
      setDaysRemaining(selectedDays);
      setIsDeviceAdminActive(true);
    }
  };

  const handleSaveMessage = async () => {
    const msg = tempMessage.trim();
    if (msg) {
      await AppBlocker.setBlockedScreenMessage(msg);
      setBlockedScreenMessage(msg);
    } else {
      await AppBlocker.setBlockedScreenMessage('');
      setBlockedScreenMessage(null);
    }
    setShowMessageModal(false);
  };

  const handleSaveCountdown = async () => {
    await AppBlocker.setBlockedScreenCountdown(tempCountdown);
    setBlockedScreenCountdown(tempCountdown);
    setShowCountdownModal(false);
  };

  const handleSaveRedirectUrl = async () => {
    const url = tempRedirectUrl.trim();
    if (url) {
      await AppBlocker.setRedirectUrl(url);
      setRedirectUrl(url);
    } else {
      await AppBlocker.setRedirectUrl('');
      setRedirectUrl(null);
    }
    setShowRedirectModal(false);
  };

  const formatCountdownValue = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${seconds} ${seconds === 1 ? t('blocking.second') : t('blocking.seconds')}`;
  };

  const getProtectionSubtitle = () => {
    if (!isDeviceAdminActive || !protectionEndDate) return undefined;
    if (daysRemaining <= 0) return t('blocking.uninstallProtectionExpired');
    return t('blocking.uninstallProtectionActive', { days: daysRemaining });
  };

  // Derive status for header badge
  const activeFeatures = [isAccessibilityEnabled, isDeviceAdminActive].filter(Boolean).length;

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Ban size={26} color={colors.primary} strokeWidth={1.5} />
            <Text style={styles.title}>{t('blocking.title')}</Text>
          </View>
          {activeFeatures > 0 && (
            <View style={styles.statusBadge}>
              <ShieldCheck size={14} color={colors.protected} strokeWidth={2} />
              <Text style={styles.statusText}>
                {t('blocking.activeFeaturesCount', { count: activeFeatures })}
              </Text>
            </View>
          )}
        </View>

        {/* Content Blocking Section */}
        <SectionCard icon={Shield} title={t('blocking.contentBlocking')}>
          <ToggleItem
            title={t('blocking.blockAdultContent')}
            subtitle={
              isAccessibilityEnabled
                ? t('blocking.vpnActive')
                : undefined
            }
            value={isAccessibilityEnabled}
            onValueChange={handleAdultContentToggle}
            disabled={isLoading}
            showInfo
            onInfoPress={() => showInfo('blocking.blockAdultContent', 'blocking.infoBlockAdultContent')}
          />
          <ToggleItem
            title={t('blocking.blockImageVideoSearch')}
            value={imageVideoSearchBlocked}
            onValueChange={setImageVideoSearchBlocked}
            disabled
            showInfo
            onInfoPress={() => showInfo('blocking.blockImageVideoSearch', 'blocking.infoBlockImageVideoSearch')}
          />
          <ToggleItem
            title={t('blocking.blockFacebookReels')}
            value={facebookReelsBlocked}
            onValueChange={setFacebookReelsBlocked}
            disabled
            showInfo
            onInfoPress={() => showInfo('blocking.blockFacebookReels', 'blocking.infoBlockFacebookReels')}
          />
          <ToggleItem
            title={t('blocking.blockYoutubeShorts')}
            value={youtubeShortsBlocked}
            onValueChange={setYoutubeShortsBlocked}
            disabled
            showInfo
            onInfoPress={() => showInfo('blocking.blockYoutubeShorts', 'blocking.infoBlockYoutubeShorts')}
          />
          <ToggleItem
            title={t('blocking.blockWhatsappChannels')}
            value={whatsappChannelsBlocked}
            onValueChange={setWhatsappChannelsBlocked}
            disabled
            showInfo
            onInfoPress={() => showInfo('blocking.blockWhatsappChannels', 'blocking.infoBlockWhatsappChannels')}
          />
          <ToggleItem
            title={t('blocking.blockTelegramSearch')}
            value={telegramSearchBlocked}
            onValueChange={setTelegramSearchBlocked}
            disabled
            showInfo
            onInfoPress={() => showInfo('blocking.blockTelegramSearch', 'blocking.infoBlockTelegramSearch')}
          />
        </SectionCard>

        {/* Advanced Blocking Section */}
        <SectionCard icon={Lock} title={t('blocking.advancedBlocking')}>
          <ToggleItem
            title={t('blocking.uninstallProtection')}
            subtitle={getProtectionSubtitle()}
            value={isDeviceAdminActive}
            onValueChange={handleUninstallProtectionToggle}
            disabled={isLoading}
            showInfo
            onInfoPress={() => showInfo('blocking.uninstallProtection', 'blocking.infoUninstallProtection')}
          />
          <ToggleItem
            title={t('blocking.blockUnsupportedBrowsers')}
            value={blockUnsupportedBrowsers}
            onValueChange={handleBlockUnsupportedBrowsersToggle}
            disabled={isLoading || !isAccessibilityEnabled}
            showInfo
            onInfoPress={() => showInfo('blocking.blockUnsupportedBrowsers', 'blocking.infoBlockUnsupportedBrowsers')}
          />
          <ToggleItem
            title={t('blocking.blockNewlyInstalledApps')}
            value={blockNewlyInstalledApps}
            onValueChange={setBlockNewlyInstalledApps}
            disabled
            showInfo
            onInfoPress={() => showInfo('blocking.blockNewlyInstalledApps', 'blocking.infoBlockNewlyInstalledApps')}
          />
        </SectionCard>

        {/* Customize Blocked Screen Section */}
        <SectionCard icon={SquarePen} title={t('blocking.customizeBlockedScreen')}>
          <EditableItem
            title={t('blocking.blockedScreenMessage')}
            value={blockedScreenMessage || t('blocking.notSet')}
            onPress={() => {
              setTempMessage(blockedScreenMessage || '');
              setShowMessageModal(true);
            }}
            onInfoPress={() => showInfo('blocking.blockedScreenMessage', 'blocking.infoBlockedScreenMessage')}
          />
          <EditableItem
            title={t('blocking.blockedScreenCountdown')}
            value={formatCountdownValue(blockedScreenCountdown)}
            onPress={() => {
              setTempCountdown(blockedScreenCountdown);
              setShowCountdownModal(true);
            }}
            onInfoPress={() => showInfo('blocking.blockedScreenCountdown', 'blocking.infoBlockedScreenCountdown')}
          />
          <EditableItem
            title={t('blocking.redirectAfterClosing')}
            value={redirectUrl || t('blocking.notSet')}
            onPress={() => {
              setTempRedirectUrl(redirectUrl || '');
              setShowRedirectModal(true);
            }}
            onInfoPress={() => showInfo('blocking.redirectUrl', 'blocking.infoRedirectUrl')}
          />
        </SectionCard>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Days Selection Modal */}
      <SettingsModal
        visible={showDaysModal}
        onClose={() => setShowDaysModal(false)}
        onSave={handleActivateProtection}
        icon={Clock}
        title={t('blocking.selectProtectionDays')}
        description={t('blocking.selectProtectionDaysDesc')}
        saveLabel={t('blocking.activate')}
        cancelLabel={t('common.cancel')}
        saveIcon={<ShieldCheck size={18} color={colors.textOnPrimary} strokeWidth={2} />}
      >
        <View style={styles.optionGrid}>
          {DAY_OPTIONS.map((days) => {
            const isSelected = selectedDays === days;
            return (
              <TouchableOpacity
                key={days}
                style={[
                  styles.optionPill,
                  styles.optionPillWide,
                  isSelected && styles.optionPillSelected,
                ]}
                onPress={() => setSelectedDays(days)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionPillText,
                    isSelected && styles.optionPillTextSelected,
                  ]}
                >
                  {t(`blocking.days${days}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SettingsModal>

      {/* Message Modal */}
      <SettingsModal
        visible={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        onSave={handleSaveMessage}
        icon={SquarePen}
        title={t('blocking.blockedScreenMessage')}
        description={t('blocking.enterMessage')}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
      >
        <TextInput
          style={styles.textInputField}
          value={tempMessage}
          onChangeText={setTempMessage}
          placeholder={t('blocking.defaultBlockedMessage')}
          placeholderTextColor={colors.textMuted}
          multiline
        />
      </SettingsModal>

      {/* Countdown Modal */}
      <SettingsModal
        visible={showCountdownModal}
        onClose={() => setShowCountdownModal(false)}
        onSave={handleSaveCountdown}
        icon={Clock}
        title={t('blocking.blockedScreenCountdown')}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
      >
        <View style={styles.optionGrid}>
          {COUNTDOWN_OPTIONS.map((seconds) => {
            const isSelected = tempCountdown === seconds;
            return (
              <TouchableOpacity
                key={seconds}
                style={[
                  styles.optionPill,
                  isSelected && styles.optionPillSelected,
                ]}
                onPress={() => setTempCountdown(seconds)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionPillText,
                    isSelected && styles.optionPillTextSelected,
                  ]}
                >
                  {formatCountdownValue(seconds)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SettingsModal>

      {/* Redirect URL Modal */}
      <SettingsModal
        visible={showRedirectModal}
        onClose={() => setShowRedirectModal(false)}
        onSave={handleSaveRedirectUrl}
        icon={SquarePen}
        title={t('blocking.redirectUrl')}
        description={t('blocking.redirectAfterClosing')}
        saveLabel={t('common.save')}
        cancelLabel={t('common.cancel')}
      >
        <TextInput
          style={styles.textInputField}
          value={tempRedirectUrl}
          onChangeText={setTempRedirectUrl}
          placeholder="https://example.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </SettingsModal>

      {/* Info Modal (shared) */}
      <InfoModal
        visible={infoContent !== null}
        onClose={() => setInfoContent(null)}
        title={infoContent?.title ?? ''}
        body={infoContent?.body ?? ''}
        closeLabel={t('blocking.gotIt')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.protectedBackground,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.protectedLight + '40',
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    color: colors.protected,
    fontVariant: ['tabular-nums'],
  },
  bottomPadding: {
    height: 8,
  },

  // Shared modal content styles
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 28,
    width: '100%',
  },
  optionPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
    minWidth: 65,
    alignItems: 'center',
  },
  optionPillWide: {
    minWidth: 85,
    paddingHorizontal: 18,
  },
  optionPillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.protectedBackground,
    boxShadow: '0 0 0 1px ' + colors.primaryLight + '40',
  },
  optionPillText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  optionPillTextSelected: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  textInputField: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: 12,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    marginBottom: 24,
    minHeight: 48,
  },
});

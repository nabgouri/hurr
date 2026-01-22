import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Ban,
  Shield,
  Palette,
  X,
} from 'lucide-react-native';
import { colors, fonts, fontSizes, globalStyles } from '../theme';
import SectionCard from '../components/SectionCard';
import ToggleItem from '../components/ToggleItem';
import EditableItem from '../components/EditableItem';
import { WebBlocker } from '../modules';
import { StorageService, WebBlockerConfig } from '../services/StorageService';
import { allAdultKeywords, adultDomains } from '../data/adultBlocklist';

export default function BlockingScreen() {
  const { t } = useTranslation();

  // Functional state - adult content blocking
  const [adultContentBlocked, setAdultContentBlocked] = useState(false);
  const [isVpnActive, setIsVpnActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Web blocker config
  const [webBlockerConfig, setWebBlockerConfig] = useState<WebBlockerConfig>({
    message: t('blocking.defaultBlockedMessage'),
    countdownSeconds: 3,
    redirectUrl: 'https://google.com',
  });

  // Modal states for editing
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<'message' | 'countdown' | 'redirect' | null>(null);
  const [editValue, setEditValue] = useState('');

  // Placeholder states (non-functional, just for structure)
  const [imageVideoSearchBlocked, setImageVideoSearchBlocked] = useState(false);
  const [facebookReelsBlocked, setFacebookReelsBlocked] = useState(false);
  const [youtubeShortsBlocked, setYoutubeShortsBlocked] = useState(false);
  const [whatsappChannelsBlocked, setWhatsappChannelsBlocked] = useState(false);
  const [telegramSearchBlocked, setTelegramSearchBlocked] = useState(false);

  // Advanced blocking states (placeholder)
  const [uninstallProtection, setUninstallProtection] = useState(false);
  const [blockUnsupportedBrowsers, setBlockUnsupportedBrowsers] = useState(false);
  const [blockNewlyInstalledApps, setBlockNewlyInstalledApps] = useState(false);

  // Load initial state
  useEffect(() => {
    loadInitialState();
  }, []);

  const loadInitialState = async () => {
    try {
      setIsLoading(true);

      // Load settings
      const settings = await StorageService.getSettings();
      setAdultContentBlocked(settings.adultContentBlocked);

      // Load web blocker config
      const config = await StorageService.getWebBlockerConfig();
      setWebBlockerConfig(config);

      // Check VPN status
      if (WebBlocker.isAvailable()) {
        const vpnActive = await WebBlocker.isVpnActive();
        setIsVpnActive(vpnActive);

        // Sync native module with stored settings if VPN is active
        if (vpnActive) {
          await syncNativeConfig(config);
        }
      }
    } catch (error) {
      console.error('Error loading initial state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncNativeConfig = async (config: WebBlockerConfig) => {
    if (!WebBlocker.isAvailable()) return;

    try {
      // Set blocking screen config
      await WebBlocker.setBlockingScreenConfig(
        config.message,
        config.countdownSeconds,
        config.redirectUrl
      );

      // Set blocked domains and keywords
      await WebBlocker.setBlockedDomains(adultDomains);
      await WebBlocker.setBlockedKeywords(allAdultKeywords);
    } catch (error) {
      console.error('Error syncing native config:', error);
    }
  };

  const handleAdultContentToggle = async (value: boolean) => {
    if (!WebBlocker.isAvailable()) {
      Alert.alert(
        t('common.error'),
        'VPN module not available on this device'
      );
      return;
    }

    setAdultContentBlocked(value);

    try {
      if (value) {
        // Start VPN
        const started = await WebBlocker.startVpn();
        if (started) {
          setIsVpnActive(true);

          // Configure the VPN with current settings
          await syncNativeConfig(webBlockerConfig);
          await WebBlocker.setAdultContentBlocked(true);

          // Save settings
          await StorageService.setSettings({ adultContentBlocked: true, vpnEnabled: true });
        } else {
          // User denied VPN permission or error occurred
          setAdultContentBlocked(false);
          Alert.alert(
            t('common.error'),
            t('onboarding.vpnPermissionDescription')
          );
        }
      } else {
        // Stop VPN
        await WebBlocker.stopVpn();
        setIsVpnActive(false);
        await WebBlocker.setAdultContentBlocked(false);

        // Save settings
        await StorageService.setSettings({ adultContentBlocked: false, vpnEnabled: false });
      }
    } catch (error) {
      console.error('Error toggling adult content blocking:', error);
      setAdultContentBlocked(!value); // Revert on error
    }
  };

  const openEditModal = (field: 'message' | 'countdown' | 'redirect') => {
    setEditField(field);
    switch (field) {
      case 'message':
        setEditValue(webBlockerConfig.message);
        break;
      case 'countdown':
        setEditValue(webBlockerConfig.countdownSeconds.toString());
        break;
      case 'redirect':
        setEditValue(webBlockerConfig.redirectUrl);
        break;
    }
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editField) return;

    let newConfig = { ...webBlockerConfig };

    switch (editField) {
      case 'message':
        newConfig.message = editValue.trim() || t('blocking.defaultBlockedMessage');
        break;
      case 'countdown':
        const countdown = parseInt(editValue, 10);
        newConfig.countdownSeconds = isNaN(countdown) || countdown < 0 ? 3 : countdown;
        break;
      case 'redirect':
        let url = editValue.trim();
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        newConfig.redirectUrl = url || 'https://google.com';
        break;
    }

    setWebBlockerConfig(newConfig);
    setEditModalVisible(false);

    // Save to storage
    await StorageService.setWebBlockerConfig(newConfig);

    // Sync with native if VPN is active
    if (isVpnActive) {
      await syncNativeConfig(newConfig);
    }
  };

  const getCountdownDisplay = () => {
    const seconds = webBlockerConfig.countdownSeconds;
    return `${seconds} ${seconds === 1 ? t('blocking.second') : t('blocking.seconds')}`;
  };

  const getEditModalTitle = () => {
    switch (editField) {
      case 'message':
        return t('blocking.blockedScreenMessage');
      case 'countdown':
        return t('blocking.blockedScreenCountdown');
      case 'redirect':
        return t('blocking.redirectUrl');
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ban size={28} color={colors.primary} strokeWidth={1.5} />
          <Text style={styles.title}>{t('blocking.title')}</Text>
        </View>

        {/* Content Blocking Section */}
        <SectionCard icon={Shield} title={t('blocking.contentBlocking')}>
          <ToggleItem
            title={t('blocking.blockAdultContent')}
            subtitle={isVpnActive ? t('blocking.vpnActive') : undefined}
            value={adultContentBlocked}
            onValueChange={handleAdultContentToggle}
            disabled={isLoading}
          />
          <ToggleItem
            title={t('blocking.blockImageVideoSearch')}
            value={imageVideoSearchBlocked}
            onValueChange={setImageVideoSearchBlocked}
            disabled
          />
          <ToggleItem
            title={t('blocking.blockFacebookReels')}
            value={facebookReelsBlocked}
            onValueChange={setFacebookReelsBlocked}
            disabled
          />
          <ToggleItem
            title={t('blocking.blockYoutubeShorts')}
            value={youtubeShortsBlocked}
            onValueChange={setYoutubeShortsBlocked}
            disabled
          />
          <ToggleItem
            title={t('blocking.blockWhatsappChannels')}
            value={whatsappChannelsBlocked}
            onValueChange={setWhatsappChannelsBlocked}
            disabled
          />
          <ToggleItem
            title={t('blocking.blockTelegramSearch')}
            value={telegramSearchBlocked}
            onValueChange={setTelegramSearchBlocked}
            disabled
          />
        </SectionCard>

        {/* Advanced Blocking Section */}
        <SectionCard icon={Shield} title={t('blocking.advancedBlocking')}>
          <ToggleItem
            title={t('blocking.uninstallProtection')}
            subtitle={t('blocking.completedDays', { days: 0, total: 90 })}
            value={uninstallProtection}
            onValueChange={setUninstallProtection}
            disabled
          />
          <ToggleItem
            title={t('blocking.blockUnsupportedBrowsers')}
            value={blockUnsupportedBrowsers}
            onValueChange={setBlockUnsupportedBrowsers}
            disabled
          />
          <ToggleItem
            title={t('blocking.blockNewlyInstalledApps')}
            value={blockNewlyInstalledApps}
            onValueChange={setBlockNewlyInstalledApps}
            disabled
          />
        </SectionCard>

        {/* Customize Blocked Screen Section */}
        <SectionCard icon={Palette} title={t('blocking.customizeBlockedScreen')}>
          <EditableItem
            title={t('blocking.blockedScreenMessage')}
            value={webBlockerConfig.message}
            onPress={() => openEditModal('message')}
          />
          <EditableItem
            title={t('blocking.blockedScreenCountdown')}
            value={getCountdownDisplay()}
            onPress={() => openEditModal('countdown')}
          />
          <EditableItem
            title={t('blocking.redirectUrl')}
            value={webBlockerConfig.redirectUrl}
            onPress={() => openEditModal('redirect')}
          />
        </SectionCard>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getEditModalTitle()}</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={getEditModalTitle()}
              placeholderTextColor={colors.textSecondary}
              keyboardType={editField === 'countdown' ? 'numeric' : 'default'}
              autoCapitalize="none"
              autoCorrect={false}
              multiline={editField === 'message'}
              numberOfLines={editField === 'message' ? 3 : 1}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: 20,
    minHeight: 50,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.white,
  },
});

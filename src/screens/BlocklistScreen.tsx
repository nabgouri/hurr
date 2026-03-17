import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  List,
  Plus,
  Smartphone,
  Globe,
  Trash2,
} from 'lucide-react-native';
import { colors, fonts, fontSizes, globalStyles } from '../theme';
import { useBlockedApps } from '../hooks/useBlockedApps';
import { useBlockedKeywords } from '../hooks/useBlockedKeywords';
import { AppBlocker, InstalledApp } from '../modules/AppBlocker';
import { BlockedApp, BlockedKeyword } from '../services/StorageService';
import ActionPickerSheet from '../components/ActionPickerSheet';
import AppSelectorSheet from '../components/AppSelectorSheet';
import ConfirmBlockModal from '../components/ConfirmBlockModal';
import KeywordInputSheet from '../components/KeywordInputSheet';

type MainTab = 'blocklist' | 'whitelist';
type SubTab = 'apps' | 'keywords';

interface ConfirmState {
  visible: boolean;
  app: InstalledApp | null;
  icon: string;
}

export default function BlocklistScreen() {
  const { t } = useTranslation();

  const [mainTab, setMainTab] = useState<MainTab>('blocklist');
  const [subTab, setSubTab] = useState<SubTab>('apps');

  const {
    blockedApps,
    loading,
    addBlockedApp,
    removeBlockedApp,
  } = useBlockedApps();

  const {
    blockedKeywords,
    loading: keywordsLoading,
    addBlockedKeyword,
    removeBlockedKeyword,
    isKeywordBlocked,
  } = useBlockedKeywords();

  // Placeholder data for whitelist (not yet implemented)
  const whitelistedApps: string[] = [];
  const whitelistedKeywords: string[] = [];

  // Sheet/modal state
  const [actionPickerVisible, setActionPickerVisible] = useState(false);
  const [appSelectorVisible, setAppSelectorVisible] = useState(false);
  const [keywordInputVisible, setKeywordInputVisible] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    visible: false,
    app: null,
    icon: '',
  });

  const getAppsCount = () => {
    return mainTab === 'blocklist' ? blockedApps.length : whitelistedApps.length;
  };

  const getKeywordsCount = () => {
    return mainTab === 'blocklist' ? blockedKeywords.length : whitelistedKeywords.length;
  };

  const handleFabPress = () => {
    setActionPickerVisible(true);
  };

  const handleBlockApp = () => {
    setActionPickerVisible(false);
    setAppSelectorVisible(true);
  };

  const handleBlockKeyword = () => {
    setActionPickerVisible(false);
    setKeywordInputVisible(true);
  };

  const handleSelectApp = (app: InstalledApp) => {
    setAppSelectorVisible(false);
    AppBlocker.getAppIcon(app.packageName).then((icon: string) => {
      setConfirmModal({ visible: true, app, icon });
    });
  };

  const handleConfirmBlock = async () => {
    if (!confirmModal.app) return;
    const app = confirmModal.app;
    const icon = confirmModal.icon;
    setConfirmModal({ visible: false, app: null, icon: '' });
    await addBlockedApp({
      id: Date.now().toString(),
      packageName: app.packageName,
      name: app.name,
      icon,
    });
  };

  const handleCancelBlock = () => {
    setConfirmModal({ visible: false, app: null, icon: '' });
  };

  const handleAddKeyword = async (keyword: string) => {
    if (isKeywordBlocked(keyword)) return;
    setKeywordInputVisible(false);
    await addBlockedKeyword(keyword);
  };

  const blockedPackageNames = blockedApps.map((a) => a.packageName);

  // Render blocked apps list item
  const renderAppItem = useCallback(
    ({ item }: { item: BlockedApp }) => (
      <View style={styles.listItem}>
        <View style={styles.listItemInfo}>
          {item.icon ? (
            <Image
              source={{ uri: `data:image/png;base64,${item.icon}` }}
              style={styles.listItemIcon}
            />
          ) : (
            <Smartphone size={20} color={colors.primary} strokeWidth={2} />
          )}
          <Text style={styles.listItemText}>{item.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeBlockedApp(item.packageName)}
        >
          <Trash2 size={18} color={colors.blocked} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    ),
    [removeBlockedApp],
  );

  // Render keyword list item
  const renderKeywordItem = useCallback(
    ({ item }: { item: BlockedKeyword }) => (
      <View style={styles.listItem}>
        <View style={styles.listItemInfo}>
          <Globe size={20} color={colors.primary} strokeWidth={2} />
          <Text style={styles.listItemText}>{item.keyword}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeBlockedKeyword(item.id)}
        >
          <Trash2 size={18} color={colors.blocked} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    ),
    [removeBlockedKeyword],
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        {subTab === 'apps' ? (
          <Smartphone size={48} color={colors.textMuted} strokeWidth={1.5} />
        ) : (
          <Globe size={48} color={colors.textMuted} strokeWidth={1.5} />
        )}
      </View>
      <Text style={styles.emptyTitle}>
        {mainTab === 'blocklist'
          ? t('blocklist.noBlockedItems')
          : t('blocklist.noWhitelistedItems')}
      </Text>
      <Text style={styles.emptySubtitle}>
        {subTab === 'apps'
          ? t('blocklist.tapToAddApps')
          : t('blocklist.tapToAddKeywords')}
      </Text>
    </View>
  );

  const renderContent = () => {
    if (mainTab === 'blocklist' && subTab === 'apps') {
      if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        );
      }
      return (
        <FlatList
          data={blockedApps}
          keyExtractor={(item) => item.packageName}
          renderItem={renderAppItem}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            blockedApps.length === 0 ? styles.emptyListContainer : undefined
          }
        />
      );
    }

    if (mainTab === 'blocklist' && subTab === 'keywords') {
      if (keywordsLoading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        );
      }
      return (
        <FlatList
          data={blockedKeywords}
          keyExtractor={(item) => item.id}
          renderItem={renderKeywordItem}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            blockedKeywords.length === 0 ? styles.emptyListContainer : undefined
          }
        />
      );
    }

    // Whitelist tabs (placeholder)
    const items =
      subTab === 'apps' ? whitelistedApps : whitelistedKeywords;

    return (
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }: { item: string }) => (
          <View style={styles.listItem}>
            <View style={styles.listItemInfo}>
              <Globe size={20} color={colors.primary} strokeWidth={2} />
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          items.length === 0 ? styles.emptyListContainer : undefined
        }
      />
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <List size={28} color={colors.primary} strokeWidth={1.5} />
          <Text style={styles.title}>{t('blocklist.title')}</Text>
        </View>

        {/* Main Tab Bar - Pill Style */}
        <View style={styles.mainTabContainer}>
          <TouchableOpacity
            style={[
              styles.mainTabButton,
              mainTab === 'blocklist' && styles.mainTabButtonActive,
            ]}
            onPress={() => setMainTab('blocklist')}
          >
            <Text
              style={[
                styles.mainTabText,
                mainTab === 'blocklist' && styles.mainTabTextActive,
              ]}
            >
              {t('blocklist.blocklist')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.mainTabButton,
              mainTab === 'whitelist' && styles.mainTabButtonActive,
            ]}
            onPress={() => setMainTab('whitelist')}
          >
            <Text
              style={[
                styles.mainTabText,
                mainTab === 'whitelist' && styles.mainTabTextActive,
              ]}
            >
              {t('blocklist.whitelist')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sub Tabs */}
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            style={[
              styles.subTabButton,
              subTab === 'apps' && styles.subTabButtonActive,
            ]}
            onPress={() => setSubTab('apps')}
          >
            <Smartphone
              size={16}
              color={subTab === 'apps' ? colors.primary : colors.textMuted}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.subTabText,
                subTab === 'apps' && styles.subTabTextActive,
              ]}
            >
              {t('blocklist.apps')} ({getAppsCount()})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.subTabButton,
              subTab === 'keywords' && styles.subTabButtonActive,
            ]}
            onPress={() => setSubTab('keywords')}
          >
            <Globe
              size={16}
              color={subTab === 'keywords' ? colors.primary : colors.textMuted}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.subTabText,
                subTab === 'keywords' && styles.subTabTextActive,
              ]}
            >
              {t('blocklist.keywordsWebsites')} ({getKeywordsCount()})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>{renderContent()}</View>

        {/* FAB Button */}
        <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
          <Plus size={24} color={colors.white} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheets & Modals */}
      <ActionPickerSheet
        visible={actionPickerVisible}
        onClose={() => setActionPickerVisible(false)}
        onBlockApp={handleBlockApp}
        onBlockKeyword={handleBlockKeyword}
      />
      <AppSelectorSheet
        visible={appSelectorVisible}
        onClose={() => setAppSelectorVisible(false)}
        onSelectApp={handleSelectApp}
        blockedPackageNames={blockedPackageNames}
      />
      <ConfirmBlockModal
        visible={confirmModal.visible}
        appName={confirmModal.app?.name ?? ''}
        appIcon={confirmModal.icon}
        onCancel={handleCancelBlock}
        onConfirm={handleConfirmBlock}
      />
      <KeywordInputSheet
        visible={keywordInputVisible}
        onClose={() => setKeywordInputVisible(false)}
        onBlock={handleAddKeyword}
      />
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
  mainTabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 25,
    padding: 4,
    marginBottom: 16,
  },
  mainTabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 21,
    alignItems: 'center',
  },
  mainTabButtonActive: {
    backgroundColor: colors.primary,
  },
  mainTabText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
  mainTabTextActive: {
    color: colors.white,
    fontFamily: fonts.bold,
  },
  subTabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  subTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    gap: 8,
  },
  subTabButtonActive: {
    backgroundColor: colors.primaryLight + '30',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  subTabText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  subTabTextActive: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyListContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  listItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  listItemText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});

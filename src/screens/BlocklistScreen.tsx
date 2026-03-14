import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  List,
  Plus,
  Smartphone,
  Globe,
  Trash2,
  Search,
} from 'lucide-react-native';
import { colors, fonts, fontSizes, globalStyles } from '../theme';

type MainTab = 'blocklist' | 'whitelist';
type SubTab = 'apps' | 'keywords';

export default function BlocklistScreen() {
  const { t } = useTranslation();

  const [mainTab, setMainTab] = useState<MainTab>('blocklist');
  const [subTab, setSubTab] = useState<SubTab>('apps');

  // Placeholder data (empty for now)
  const blockedApps: string[] = [];
  const blockedKeywords: string[] = [];
  const whitelistedApps: string[] = [];
  const whitelistedKeywords: string[] = [];

  const getCurrentCount = () => {
    if (mainTab === 'blocklist') {
      return subTab === 'apps' ? blockedApps.length : blockedKeywords.length;
    }
    return subTab === 'apps' ? whitelistedApps.length : whitelistedKeywords.length;
  };

  const getAppsCount = () => {
    return mainTab === 'blocklist' ? blockedApps.length : whitelistedApps.length;
  };

  const getKeywordsCount = () => {
    return mainTab === 'blocklist' ? blockedKeywords.length : whitelistedKeywords.length;
  };

  const getCurrentItems = (): string[] => {
    if (mainTab === 'blocklist') {
      return subTab === 'apps' ? blockedApps : blockedKeywords;
    }
    return subTab === 'apps' ? whitelistedApps : whitelistedKeywords;
  };

  const keyExtractor = useCallback((item: string, index: number) => `${item}-${index}`, []);

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <View style={styles.listItem}>
        <View style={styles.listItemInfo}>
          {subTab === 'apps' ? (
            <Smartphone size={20} color={colors.primary} strokeWidth={2} />
          ) : (
            <Globe size={20} color={colors.primary} strokeWidth={2} />
          )}
          <Text style={styles.listItemText}>{item}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton}>
          <Trash2 size={18} color={colors.blocked} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    ),
    [subTab],
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
        <View style={styles.content}>
          <FlatList
            data={getCurrentItems()}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              getCurrentItems().length === 0 ? styles.emptyListContainer : undefined
            }
          />
        </View>

        {/* FAB Button */}
        <TouchableOpacity style={styles.fab} disabled>
          <Plus size={24} color={colors.white} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
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
    flexDirection: 'row-reverse',
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
    flexDirection: 'row-reverse',
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
    flexDirection: 'row-reverse',
    marginBottom: 16,
    gap: 8,
  },
  subTabButton: {
    flex: 1,
    flexDirection: 'row-reverse',
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
    flexDirection: 'row-reverse',
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  listItemText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
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
    opacity: 0.5,
  },
});

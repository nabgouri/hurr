import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Search as SearchIcon, Smartphone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, fontSizes } from '../theme';
import { AppBlocker, InstalledApp } from '../modules/AppBlocker';
import { useAppIcon } from '../hooks/useAppIcon';
import BottomSheet from './BottomSheet';

interface AppSelectorSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectApp: (app: InstalledApp) => void;
  blockedPackageNames: string[];
}

function AppRow({
  app,
  onPress,
}: {
  app: InstalledApp;
  onPress: () => void;
}) {
  const icon = useAppIcon(app.packageName);

  return (
    <TouchableOpacity style={styles.appRow} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.appIconContainer}>
        {icon ? (
          <Image
            source={{ uri: `data:image/png;base64,${icon}` }}
            style={styles.appIcon}
          />
        ) : (
          <Smartphone size={20} color={colors.textMuted} strokeWidth={1.5} />
        )}
      </View>
      <Text style={styles.appName}>{app.name}</Text>
    </TouchableOpacity>
  );
}

export default function AppSelectorSheet({
  visible,
  onClose,
  onSelectApp,
  blockedPackageNames,
}: AppSelectorSheetProps) {
  const { t } = useTranslation();
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (visible) {
      setSearch('');
      setLoading(true);
      AppBlocker.getInstalledApps()
        .then((installed) => {
          const filtered = installed.filter(
            (a) => !blockedPackageNames.includes(a.packageName),
          );
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          setApps(filtered);
        })
        .finally(() => setLoading(false));
    }
  }, [visible, blockedPackageNames]);

  const filteredApps = search
    ? apps.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase()),
      )
    : apps;

  const keyExtractor = useCallback(
    (item: InstalledApp) => item.packageName,
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: InstalledApp }) => (
      <AppRow app={item} onPress={() => onSelectApp(item)} />
    ),
    [onSelectApp],
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t('blocklist.blockApp')}
      height="80%"
    >
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <SearchIcon size={18} color={colors.textMuted} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('blocklist.search')}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
        </View>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{t('blocklist.loadingApps')}</Text>
          </View>
        ) : filteredApps.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>{t('blocklist.noAppsFound')}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredApps}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    paddingVertical: 12,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
    gap: 12,
  },
  appIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  appName: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: 12,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textMuted,
  },
});

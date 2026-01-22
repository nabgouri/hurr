import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, fonts, fontSizes } from '../theme';

interface AppListItemProps {
  name: string;
  packageName: string;
  icon?: string; // emoji or URI
  isBlocked: boolean;
  onToggleBlock: () => void;
  blockLabel: string;
  unblockLabel: string;
}

export default function AppListItem({
  name,
  packageName,
  icon,
  isBlocked,
  onToggleBlock,
  blockLabel,
  unblockLabel,
}: AppListItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon || '📱'}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.packageName}>{packageName}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.blockButton, isBlocked && styles.blockButtonActive]}
        onPress={onToggleBlock}
      >
        <Text style={[styles.blockButtonText, isBlocked && styles.blockButtonTextActive]}>
          {isBlocked ? unblockLabel : blockLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  packageName: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  blockButton: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  blockButtonActive: {
    backgroundColor: colors.blockedBackground,
    borderColor: colors.blocked,
  },
  blockButtonText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  blockButtonTextActive: {
    color: colors.blocked,
  },
});

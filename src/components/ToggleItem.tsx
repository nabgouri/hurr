import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Info } from 'lucide-react-native';
import { colors, fonts, fontSizes } from '../theme';

interface ToggleItemProps {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  showInfo?: boolean;
  onInfoPress?: () => void;
}

export default function ToggleItem({
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false,
  showInfo = false,
  onInfoPress,
}: ToggleItemProps) {
  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <View style={styles.labelContainer}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, disabled && styles.titleDisabled]}>{title}</Text>
          {subtitle && (
            <Text
              selectable
              style={[styles.subtitle, disabled && styles.subtitleDisabled]}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {showInfo && (
          <TouchableOpacity onPress={onInfoPress} style={styles.infoButton}>
            <Info size={18} color={colors.textMuted} strokeWidth={1.5} />
          </TouchableOpacity>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.borderLight, true: colors.primaryLight + '80' }}
        thumbColor={value ? colors.primary : colors.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  containerDisabled: {
    opacity: 0.45,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  titleDisabled: {
    color: colors.textMuted,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.xs,
    color: colors.protected,
    lineHeight: fontSizes.xs * 1.4,
  },
  subtitleDisabled: {
    color: colors.border,
  },
  infoButton: {
    padding: 4,
  },
});

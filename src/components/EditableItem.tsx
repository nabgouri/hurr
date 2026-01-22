import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { colors, fonts, fontSizes } from '../theme';

interface EditableItemProps {
  title: string;
  value: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function EditableItem({
  title,
  value,
  onPress,
  disabled = false,
}: EditableItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.containerDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.textContainer}>
        <Text style={[styles.title, disabled && styles.titleDisabled]}>{title}</Text>
        <Text style={[styles.value, disabled && styles.valueDisabled]}>{value}</Text>
      </View>
      <View style={styles.editButton}>
        <Pencil size={16} color={disabled ? colors.border : colors.primary} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  titleDisabled: {
    color: colors.textMuted,
  },
  value: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  valueDisabled: {
    color: colors.border,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fonts, fontSizes } from '../theme';

interface PermissionPromptProps {
  emoji: string;
  title: string;
  description: string;
  buttonText: string;
  granted?: boolean;
  onPress: () => void;
}

export default function PermissionPrompt({
  emoji,
  title,
  description,
  buttonText,
  granted,
  onPress,
}: PermissionPromptProps) {
  return (
    <View style={[styles.container, granted && styles.containerGranted]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.button, granted && styles.buttonGranted]}
        onPress={onPress}
        disabled={granted}
      >
        <Text style={[styles.buttonText, granted && styles.buttonTextGranted]}>
          {granted ? '✓' : buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 12,
  },
  containerGranted: {
    borderColor: colors.protected,
    backgroundColor: colors.protectedBackground,
  },
  content: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
    marginLeft: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: 4,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'right',
    lineHeight: fontSizes.sm * 1.5,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonGranted: {
    backgroundColor: colors.protected,
  },
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textOnPrimary,
  },
  buttonTextGranted: {
    color: colors.white,
  },
});

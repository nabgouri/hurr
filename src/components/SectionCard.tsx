import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes } from '../theme';
import { LucideIcon } from 'lucide-react-native';

interface SectionCardProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

export default function SectionCard({ icon: Icon, title, children }: SectionCardProps) {
  return (
    <View style={styles.container}>
      {/* Ribbon/Banner Header */}
      <View style={styles.ribbon}>
        <View style={styles.ribbonContent}>
          <Icon size={16} color={colors.primary} strokeWidth={2.5} />
          <Text style={styles.ribbonText}>{title}</Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderCurve: 'continuous',
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
  },
  ribbon: {
    backgroundColor: colors.surfaceVariant,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  ribbonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ribbonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.sm,
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: 4,
    paddingHorizontal: 16,
  },
});

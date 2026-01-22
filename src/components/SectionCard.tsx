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
          <Icon size={18} color={colors.white} strokeWidth={2} />
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
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ribbon: {
    backgroundColor: colors.textSecondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  ribbonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ribbonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.white,
  },
  content: {
    padding: 16,
  },
});

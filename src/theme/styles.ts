import { StyleSheet, I18nManager, TextStyle, ViewStyle } from 'react-native';
import { colors } from './colors';
import { fonts, fontSizes } from './fonts';

// RTL-aware flex direction
export const rowDirection = (): ViewStyle['flexDirection'] =>
  I18nManager.isRTL ? 'row-reverse' : 'row';

// RTL-aware text alignment
export const textAlign = (): TextStyle['textAlign'] =>
  I18nManager.isRTL ? 'right' : 'left';

// RTL-aware margin/padding
export const marginStart = (value: number): ViewStyle =>
  I18nManager.isRTL ? { marginRight: value } : { marginLeft: value };

export const marginEnd = (value: number): ViewStyle =>
  I18nManager.isRTL ? { marginLeft: value } : { marginRight: value };

export const paddingStart = (value: number): ViewStyle =>
  I18nManager.isRTL ? { paddingRight: value } : { paddingLeft: value };

export const paddingEnd = (value: number): ViewStyle =>
  I18nManager.isRTL ? { paddingLeft: value } : { paddingRight: value };

export const globalStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderCurve: 'continuous',
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
  },
  cardHeader: {
    flexDirection: 'row-reverse', // RTL default
    alignItems: 'center',
    marginBottom: 12,
  },

  // Typography — writingDirection must be on Text components (not inherited from Views)
  textTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  textSubtitle: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  textBody: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: fontSizes.md * 1.5,
  },
  textCaption: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  textLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  // Buttons
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row-reverse',
  },
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.textOnPrimary,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonSecondaryText: {
    color: colors.primary,
  },
  buttonDisabled: {
    backgroundColor: colors.border,
  },
  buttonDisabledText: {
    color: colors.textMuted,
  },

  // Input
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  // List Items
  listItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  listItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12, // RTL: margin on left
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  listItemSubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },

  // Status badges
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSuccess: {
    backgroundColor: colors.protectedBackground,
  },
  badgeSuccessText: {
    color: colors.protected,
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
  },
  badgeError: {
    backgroundColor: colors.blockedBackground,
  },
  badgeErrorText: {
    color: colors.blocked,
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
  },

  // Row with icon
  rowWithIcon: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  // Spacing helpers
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
  mb24: { marginBottom: 24 },
  p16: { padding: 16 },
  ph16: { paddingHorizontal: 16 },
  pv16: { paddingVertical: 16 },
});

export default globalStyles;

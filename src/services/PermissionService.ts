import { Platform } from 'react-native';
import { AppBlocker, DeviceAdmin } from '../modules';

export type PermissionType =
  | 'usageStats'
  | 'overlay'
  | 'accessibility'
  | 'deviceAdmin';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

export const PermissionService = {
  async checkPermission(permission: PermissionType): Promise<PermissionStatus> {
    if (Platform.OS !== 'android') {
      return { granted: false, canAskAgain: false };
    }

    switch (permission) {
      case 'usageStats':
        return this.checkUsageStatsPermission();
      case 'overlay':
        return this.checkOverlayPermission();
      case 'accessibility':
        return this.checkAccessibilityPermission();
      case 'deviceAdmin':
        return this.checkDeviceAdminPermission();
      default:
        return { granted: false, canAskAgain: true };
    }
  },

  async checkAllPermissions(): Promise<Record<PermissionType, PermissionStatus>> {
    const permissions: PermissionType[] = [
      'usageStats',
      'overlay',
      'accessibility',
      'deviceAdmin',
    ];

    const results: Record<string, PermissionStatus> = {};

    for (const permission of permissions) {
      results[permission] = await this.checkPermission(permission);
    }

    return results as Record<PermissionType, PermissionStatus>;
  },

  async requestPermission(permission: PermissionType): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    switch (permission) {
      case 'usageStats':
        return this.requestUsageStatsPermission();
      case 'overlay':
        return this.requestOverlayPermission();
      case 'accessibility':
        return this.requestAccessibilityPermission();
      case 'deviceAdmin':
        return this.requestDeviceAdminPermission();
      default:
        return false;
    }
  },

  // --- Usage Stats ---

  async checkUsageStatsPermission(): Promise<PermissionStatus> {
    const granted = await AppBlocker.hasUsageStatsPermission();
    return { granted, canAskAgain: true };
  },

  async requestUsageStatsPermission(): Promise<boolean> {
    return AppBlocker.openUsageStatsSettings();
  },

  // --- Overlay ---

  async checkOverlayPermission(): Promise<PermissionStatus> {
    const granted = await AppBlocker.hasOverlayPermission();
    return { granted, canAskAgain: true };
  },

  async requestOverlayPermission(): Promise<boolean> {
    return AppBlocker.openOverlaySettings();
  },

  // --- Accessibility ---

  async checkAccessibilityPermission(): Promise<PermissionStatus> {
    const granted = await AppBlocker.isAccessibilityServiceEnabled();
    return { granted, canAskAgain: true };
  },

  async requestAccessibilityPermission(): Promise<boolean> {
    return AppBlocker.openAccessibilitySettings();
  },

  // --- Device Admin ---

  async checkDeviceAdminPermission(): Promise<PermissionStatus> {
    const granted = await DeviceAdmin.isDeviceAdminActive();
    return { granted, canAskAgain: true };
  },

  async requestDeviceAdminPermission(): Promise<boolean> {
    return DeviceAdmin.requestDeviceAdmin();
  },

  // --- Helpers ---

  async hasMinimumPermissions(): Promise<boolean> {
    const required: PermissionType[] = ['usageStats', 'overlay', 'accessibility'];

    for (const permission of required) {
      const status = await this.checkPermission(permission);
      if (!status.granted) {
        return false;
      }
    }

    return true;
  },

  getPermissionInfo(permission: PermissionType): {
    titleKey: string;
    descriptionKey: string;
    emoji: string;
    required: boolean;
  } {
    const info: Record<PermissionType, ReturnType<typeof PermissionService.getPermissionInfo>> = {
      usageStats: {
        titleKey: 'onboarding.usageAccess',
        descriptionKey: 'onboarding.usageAccessDescription',
        emoji: '📊',
        required: true,
      },
      overlay: {
        titleKey: 'onboarding.overlayPermission',
        descriptionKey: 'onboarding.overlayPermissionDescription',
        emoji: '🖼️',
        required: true,
      },
      accessibility: {
        titleKey: 'onboarding.accessibilityService',
        descriptionKey: 'onboarding.accessibilityServiceDescription',
        emoji: '♿',
        required: true,
      },
      deviceAdmin: {
        titleKey: 'settings.pinProtection',
        descriptionKey: 'partner.selfDescription',
        emoji: '🛡️',
        required: false,
      },
    };

    return info[permission];
  },
};

export default PermissionService;

import { Platform, Linking, NativeModules } from 'react-native';

export type PermissionType =
  | 'usageStats'
  | 'overlay'
  | 'accessibility'
  | 'vpn'
  | 'deviceAdmin';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

export const PermissionService = {
  // Check if a specific permission is granted
  // Note: These checks require native modules that will be implemented in Phase 2
  async checkPermission(permission: PermissionType): Promise<PermissionStatus> {
    if (Platform.OS !== 'android') {
      return { granted: false, canAskAgain: false };
    }

    // Placeholder implementation
    // In a real app with native modules, we would check actual permissions
    switch (permission) {
      case 'usageStats':
        return this.checkUsageStatsPermission();
      case 'overlay':
        return this.checkOverlayPermission();
      case 'accessibility':
        return this.checkAccessibilityPermission();
      case 'vpn':
        return this.checkVpnPermission();
      case 'deviceAdmin':
        return this.checkDeviceAdminPermission();
      default:
        return { granted: false, canAskAgain: true };
    }
  },

  // Check all required permissions
  async checkAllPermissions(): Promise<Record<PermissionType, PermissionStatus>> {
    const permissions: PermissionType[] = [
      'usageStats',
      'overlay',
      'accessibility',
      'vpn',
      'deviceAdmin',
    ];

    const results: Record<string, PermissionStatus> = {};

    for (const permission of permissions) {
      results[permission] = await this.checkPermission(permission);
    }

    return results as Record<PermissionType, PermissionStatus>;
  },

  // Request a specific permission
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
      case 'vpn':
        return this.requestVpnPermission();
      case 'deviceAdmin':
        return this.requestDeviceAdminPermission();
      default:
        return false;
    }
  },

  // Usage Stats Permission
  async checkUsageStatsPermission(): Promise<PermissionStatus> {
    // In real implementation, check via native module
    // AppBlockerModule.hasUsageStatsPermission()
    return { granted: false, canAskAgain: true };
  },

  async requestUsageStatsPermission(): Promise<boolean> {
    try {
      // Open Usage Stats settings
      await Linking.openSettings();
      // In real implementation, we'd deep link to:
      // 'android.settings.USAGE_ACCESS_SETTINGS'
      return true;
    } catch (error) {
      console.error('Error opening usage stats settings:', error);
      return false;
    }
  },

  // Overlay Permission
  async checkOverlayPermission(): Promise<PermissionStatus> {
    // In real implementation, check via native module
    // Settings.canDrawOverlays(context)
    return { granted: false, canAskAgain: true };
  },

  async requestOverlayPermission(): Promise<boolean> {
    try {
      // Open Overlay settings
      // 'android.settings.ACTION_MANAGE_OVERLAY_PERMISSION'
      await Linking.openSettings();
      return true;
    } catch (error) {
      console.error('Error opening overlay settings:', error);
      return false;
    }
  },

  // Accessibility Permission
  async checkAccessibilityPermission(): Promise<PermissionStatus> {
    // In real implementation, check via native module
    return { granted: false, canAskAgain: true };
  },

  async requestAccessibilityPermission(): Promise<boolean> {
    try {
      // Open Accessibility settings
      // 'android.settings.ACCESSIBILITY_SETTINGS'
      await Linking.openSettings();
      return true;
    } catch (error) {
      console.error('Error opening accessibility settings:', error);
      return false;
    }
  },

  // VPN Permission
  async checkVpnPermission(): Promise<PermissionStatus> {
    // VPN permission is granted at runtime when starting VPN service
    return { granted: false, canAskAgain: true };
  },

  async requestVpnPermission(): Promise<boolean> {
    // VPN permission is requested by the VPN service
    // This would trigger the VPN dialog
    return true;
  },

  // Device Admin Permission
  async checkDeviceAdminPermission(): Promise<PermissionStatus> {
    // In real implementation, check via native module
    return { granted: false, canAskAgain: true };
  },

  async requestDeviceAdminPermission(): Promise<boolean> {
    try {
      // Open Device Admin settings
      // 'android.app.action.ADD_DEVICE_ADMIN'
      await Linking.openSettings();
      return true;
    } catch (error) {
      console.error('Error opening device admin settings:', error);
      return false;
    }
  },

  // Check if app has minimum required permissions to function
  async hasMinimumPermissions(): Promise<boolean> {
    const required: PermissionType[] = ['usageStats', 'overlay'];

    for (const permission of required) {
      const status = await this.checkPermission(permission);
      if (!status.granted) {
        return false;
      }
    }

    return true;
  },

  // Get human-readable permission description
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
      vpn: {
        titleKey: 'onboarding.vpnPermission',
        descriptionKey: 'onboarding.vpnPermissionDescription',
        emoji: '🔒',
        required: false,
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

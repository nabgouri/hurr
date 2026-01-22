import { NativeModules, Platform, NativeEventEmitter } from 'react-native';

const { AppBlockerModule } = NativeModules;

export interface InstalledApp {
  packageName: string;
  name: string;
  isSystem: boolean;
  isBlocked: boolean;
}

// Check if native module is available
const isModuleAvailable = Platform.OS === 'android' && AppBlockerModule != null;

// Event emitter for native events
const eventEmitter = isModuleAvailable
  ? new NativeEventEmitter(AppBlockerModule)
  : null;

export const AppBlocker = {
  // Check if the module is available
  isAvailable(): boolean {
    return isModuleAvailable;
  },

  // Permission checks
  async hasUsageStatsPermission(): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await AppBlockerModule.hasUsageStatsPermission();
    } catch (error) {
      console.error('Error checking usage stats permission:', error);
      return false;
    }
  },

  async openUsageStatsSettings(): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await AppBlockerModule.openUsageStatsSettings();
    } catch (error) {
      console.error('Error opening usage stats settings:', error);
      return false;
    }
  },

  async hasOverlayPermission(): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await AppBlockerModule.hasOverlayPermission();
    } catch (error) {
      console.error('Error checking overlay permission:', error);
      return false;
    }
  },

  async openOverlaySettings(): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await AppBlockerModule.openOverlaySettings();
    } catch (error) {
      console.error('Error opening overlay settings:', error);
      return false;
    }
  },

  async isAccessibilityServiceEnabled(): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await AppBlockerModule.isAccessibilityServiceEnabled();
    } catch (error) {
      console.error('Error checking accessibility service:', error);
      return false;
    }
  },

  async openAccessibilitySettings(): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await AppBlockerModule.openAccessibilitySettings();
    } catch (error) {
      console.error('Error opening accessibility settings:', error);
      return false;
    }
  },

  // App blocking functions
  async setBlockedApps(packageNames: string[]): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await AppBlockerModule.setBlockedApps(packageNames);
    } catch (error) {
      console.error('Error setting blocked apps:', error);
      return false;
    }
  },

  async getBlockedApps(): Promise<string[]> {
    if (!isModuleAvailable) return [];
    try {
      return await AppBlockerModule.getBlockedApps();
    } catch (error) {
      console.error('Error getting blocked apps:', error);
      return [];
    }
  },

  async blockApp(packageName: string): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await AppBlockerModule.blockApp(packageName);
    } catch (error) {
      console.error('Error blocking app:', error);
      return false;
    }
  },

  async unblockApp(packageName: string): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await AppBlockerModule.unblockApp(packageName);
    } catch (error) {
      console.error('Error unblocking app:', error);
      return false;
    }
  },

  async isAppBlocked(packageName: string): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await AppBlockerModule.isAppBlocked(packageName);
    } catch (error) {
      console.error('Error checking if app is blocked:', error);
      return false;
    }
  },

  async getInstalledApps(): Promise<InstalledApp[]> {
    if (!isModuleAvailable) return [];
    try {
      return await AppBlockerModule.getInstalledApps();
    } catch (error) {
      console.error('Error getting installed apps:', error);
      return [];
    }
  },

  // Check all permissions at once
  async checkAllPermissions(): Promise<{
    usageStats: boolean;
    overlay: boolean;
    accessibility: boolean;
  }> {
    if (!isModuleAvailable) {
      return { usageStats: false, overlay: false, accessibility: false };
    }

    const [usageStats, overlay, accessibility] = await Promise.all([
      this.hasUsageStatsPermission(),
      this.hasOverlayPermission(),
      this.isAccessibilityServiceEnabled(),
    ]);

    return { usageStats, overlay, accessibility };
  },

  // Check if all required permissions are granted
  async hasAllRequiredPermissions(): Promise<boolean> {
    const permissions = await this.checkAllPermissions();
    return permissions.usageStats && permissions.overlay && permissions.accessibility;
  },

  // Event subscription
  addAppBlockedListener(callback: (packageName: string) => void): () => void {
    if (!eventEmitter) return () => {};
    const subscription = eventEmitter.addListener('onAppBlocked', callback);
    return () => subscription.remove();
  },
};

export default AppBlocker;

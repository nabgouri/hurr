import { NativeModules, TurboModuleRegistry, Platform, type TurboModule } from 'react-native';

interface DeviceAdminModuleSpec extends TurboModule {
  isDeviceAdminActive(): Promise<boolean>;
  requestDeviceAdmin(): Promise<boolean>;
  removeDeviceAdmin(): Promise<boolean>;
}

// TurboModuleRegistry first (lazy-loaded), fallback to legacy NativeModules bridge
const DeviceAdminModule: DeviceAdminModuleSpec | null =
  TurboModuleRegistry.get<DeviceAdminModuleSpec>('DeviceAdminModule') ??
  NativeModules.DeviceAdminModule ??
  null;

const isModuleAvailable = Platform.OS === 'android' && DeviceAdminModule != null;

export const DeviceAdmin = {
  isAvailable(): boolean {
    return isModuleAvailable;
  },

  async isDeviceAdminActive(): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await DeviceAdminModule!.isDeviceAdminActive();
    } catch (error) {
      console.error('Error checking device admin status:', error);
      return false;
    }
  },

  async requestDeviceAdmin(): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await DeviceAdminModule!.requestDeviceAdmin();
    } catch (error) {
      console.error('Error requesting device admin:', error);
      return false;
    }
  },

  async removeDeviceAdmin(): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await DeviceAdminModule!.removeDeviceAdmin();
    } catch (error) {
      console.error('Error removing device admin:', error);
      return false;
    }
  },
};

export default DeviceAdmin;

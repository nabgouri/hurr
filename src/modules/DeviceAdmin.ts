import { requireNativeModule, Platform } from 'expo-modules-core';

const DeviceAdminModule = Platform.OS === 'android'
  ? requireNativeModule('DeviceAdminModule')
  : null;

const isModuleAvailable = DeviceAdminModule != null;

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

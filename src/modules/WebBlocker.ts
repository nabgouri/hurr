import { NativeModules, Platform } from 'react-native';

// Note: WebBlocker requires VPN service which is Phase 3
// This is a placeholder for the JavaScript interface

export interface BlockedDomain {
  domain: string;
  blockedAt: number;
}

export interface BlockedKeyword {
  keyword: string;
  blockedAt: number;
}

// The native module will be implemented in Phase 3
const { WebBlockerModule } = NativeModules;

const isModuleAvailable = Platform.OS === 'android' && WebBlockerModule != null;

export const WebBlocker = {
  // Check if the module is available
  isAvailable(): boolean {
    return isModuleAvailable;
  },

  // VPN status
  async isVpnActive(): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await WebBlockerModule.isVpnActive();
    } catch (error) {
      console.error('Error checking VPN status:', error);
      return false;
    }
  },

  async startVpn(): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await WebBlockerModule.startVpn();
    } catch (error) {
      console.error('Error starting VPN:', error);
      return false;
    }
  },

  async stopVpn(): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await WebBlockerModule.stopVpn();
    } catch (error) {
      console.error('Error stopping VPN:', error);
      return false;
    }
  },

  // Blocked domains
  async setBlockedDomains(domains: string[]): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await WebBlockerModule.setBlockedDomains(domains);
    } catch (error) {
      console.error('Error setting blocked domains:', error);
      return false;
    }
  },

  async addBlockedDomain(domain: string): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await WebBlockerModule.addBlockedDomain(domain);
    } catch (error) {
      console.error('Error adding blocked domain:', error);
      return false;
    }
  },

  async removeBlockedDomain(domain: string): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await WebBlockerModule.removeBlockedDomain(domain);
    } catch (error) {
      console.error('Error removing blocked domain:', error);
      return false;
    }
  },

  // Blocked keywords
  async setBlockedKeywords(keywords: string[]): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await WebBlockerModule.setBlockedKeywords(keywords);
    } catch (error) {
      console.error('Error setting blocked keywords:', error);
      return false;
    }
  },

  async addBlockedKeyword(keyword: string): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await WebBlockerModule.addBlockedKeyword(keyword);
    } catch (error) {
      console.error('Error adding blocked keyword:', error);
      return false;
    }
  },

  async removeBlockedKeyword(keyword: string): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await WebBlockerModule.removeBlockedKeyword(keyword);
    } catch (error) {
      console.error('Error removing blocked keyword:', error);
      return false;
    }
  },

  // Adult content blocking
  async setAdultContentBlocked(blocked: boolean): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await WebBlockerModule.setAdultContentBlocked(blocked);
    } catch (error) {
      console.error('Error setting adult content blocking:', error);
      return false;
    }
  },

  async isAdultContentBlocked(): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await WebBlockerModule.isAdultContentBlocked();
    } catch (error) {
      console.error('Error checking adult content blocking:', error);
      return false;
    }
  },

  // Blocking screen configuration
  async setBlockingScreenConfig(
    message: string,
    countdownSeconds: number,
    redirectUrl: string
  ): Promise<boolean> {
    if (!isModuleAvailable) return false;
    try {
      return await WebBlockerModule.setBlockingScreenConfig(
        message,
        countdownSeconds,
        redirectUrl
      );
    } catch (error) {
      console.error('Error setting blocking screen config:', error);
      return false;
    }
  },
};

export default WebBlocker;

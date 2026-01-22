import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  BLOCKED_APPS: '@hur_blocked_apps',
  BLOCKED_WEBSITES: '@hur_blocked_websites',
  BLOCKED_KEYWORDS: '@hur_blocked_keywords',
  SETTINGS: '@hur_settings',
  PIN_HASH: '@hur_pin_hash',
  PARTNER_CONFIG: '@hur_partner_config',
  PROTECTION_ENABLED: '@hur_protection_enabled',
  FIRST_LAUNCH: '@hur_first_launch',
  LANGUAGE: '@hur_language',
  WEB_BLOCKER_CONFIG: '@hur_web_blocker_config',
};

// Types
export interface BlockedApp {
  id: string;
  packageName: string;
  name: string;
  icon?: string;
  blockedAt: number;
}

export interface BlockedWebsite {
  id: string;
  url: string;
  blockedAt: number;
}

export interface BlockedKeyword {
  id: string;
  keyword: string;
  blockedAt: number;
}

export interface PartnerConfig {
  type: 'self' | 'friend' | 'parent';
  email?: string;
  timeDelay?: number; // in hours
  connectedAt?: number;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  adultContentBlocked: boolean;
  vpnEnabled: boolean;
}

export interface WebBlockerConfig {
  message: string;
  countdownSeconds: number;
  redirectUrl: string;
}

const defaultSettings: AppSettings = {
  notificationsEnabled: true,
  adultContentBlocked: true,
  vpnEnabled: false,
};

const defaultWebBlockerConfig: WebBlockerConfig = {
  message: 'هذه الصفحة محظورة.',
  countdownSeconds: 3,
  redirectUrl: 'https://google.com',
};

// Storage Service
export const StorageService = {
  // Blocked Apps
  async getBlockedApps(): Promise<BlockedApp[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_APPS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting blocked apps:', error);
      return [];
    }
  },

  async setBlockedApps(apps: BlockedApp[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_APPS, JSON.stringify(apps));
    } catch (error) {
      console.error('Error setting blocked apps:', error);
    }
  },

  async addBlockedApp(app: Omit<BlockedApp, 'blockedAt'>): Promise<void> {
    const apps = await this.getBlockedApps();
    const newApp: BlockedApp = { ...app, blockedAt: Date.now() };
    apps.push(newApp);
    await this.setBlockedApps(apps);
  },

  async removeBlockedApp(packageName: string): Promise<void> {
    const apps = await this.getBlockedApps();
    const filtered = apps.filter((app) => app.packageName !== packageName);
    await this.setBlockedApps(filtered);
  },

  async isAppBlocked(packageName: string): Promise<boolean> {
    const apps = await this.getBlockedApps();
    return apps.some((app) => app.packageName === packageName);
  },

  // Blocked Websites
  async getBlockedWebsites(): Promise<BlockedWebsite[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_WEBSITES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting blocked websites:', error);
      return [];
    }
  },

  async setBlockedWebsites(websites: BlockedWebsite[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_WEBSITES, JSON.stringify(websites));
    } catch (error) {
      console.error('Error setting blocked websites:', error);
    }
  },

  async addBlockedWebsite(url: string): Promise<void> {
    const websites = await this.getBlockedWebsites();
    const newWebsite: BlockedWebsite = {
      id: Date.now().toString(),
      url,
      blockedAt: Date.now(),
    };
    websites.push(newWebsite);
    await this.setBlockedWebsites(websites);
  },

  async removeBlockedWebsite(id: string): Promise<void> {
    const websites = await this.getBlockedWebsites();
    const filtered = websites.filter((w) => w.id !== id);
    await this.setBlockedWebsites(filtered);
  },

  // Blocked Keywords
  async getBlockedKeywords(): Promise<BlockedKeyword[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_KEYWORDS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting blocked keywords:', error);
      return [];
    }
  },

  async setBlockedKeywords(keywords: BlockedKeyword[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_KEYWORDS, JSON.stringify(keywords));
    } catch (error) {
      console.error('Error setting blocked keywords:', error);
    }
  },

  async addBlockedKeyword(keyword: string): Promise<void> {
    const keywords = await this.getBlockedKeywords();
    const newKeyword: BlockedKeyword = {
      id: Date.now().toString(),
      keyword,
      blockedAt: Date.now(),
    };
    keywords.push(newKeyword);
    await this.setBlockedKeywords(keywords);
  },

  async removeBlockedKeyword(id: string): Promise<void> {
    const keywords = await this.getBlockedKeywords();
    const filtered = keywords.filter((k) => k.id !== id);
    await this.setBlockedKeywords(filtered);
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return defaultSettings;
    }
  },

  async setSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error setting settings:', error);
    }
  },

  // PIN
  async getPinHash(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.PIN_HASH);
    } catch (error) {
      console.error('Error getting PIN hash:', error);
      return null;
    }
  },

  async setPinHash(hash: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PIN_HASH, hash);
    } catch (error) {
      console.error('Error setting PIN hash:', error);
    }
  },

  async clearPin(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PIN_HASH);
    } catch (error) {
      console.error('Error clearing PIN:', error);
    }
  },

  async hasPin(): Promise<boolean> {
    const hash = await this.getPinHash();
    return hash !== null;
  },

  // Partner Config
  async getPartnerConfig(): Promise<PartnerConfig | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PARTNER_CONFIG);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting partner config:', error);
      return null;
    }
  },

  async setPartnerConfig(config: PartnerConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PARTNER_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Error setting partner config:', error);
    }
  },

  async clearPartnerConfig(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PARTNER_CONFIG);
    } catch (error) {
      console.error('Error clearing partner config:', error);
    }
  },

  // Protection Status
  async isProtectionEnabled(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROTECTION_ENABLED);
      return data === 'true';
    } catch (error) {
      console.error('Error getting protection status:', error);
      return false;
    }
  },

  async setProtectionEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROTECTION_ENABLED, enabled.toString());
    } catch (error) {
      console.error('Error setting protection status:', error);
    }
  },

  // Language
  async getLanguage(): Promise<'ar' | 'en'> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return (data as 'ar' | 'en') || 'ar';
    } catch (error) {
      console.error('Error getting language:', error);
      return 'ar';
    }
  },

  async setLanguage(language: 'ar' | 'en'): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    } catch (error) {
      console.error('Error setting language:', error);
    }
  },

  // Web Blocker Config
  async getWebBlockerConfig(): Promise<WebBlockerConfig> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WEB_BLOCKER_CONFIG);
      return data ? { ...defaultWebBlockerConfig, ...JSON.parse(data) } : defaultWebBlockerConfig;
    } catch (error) {
      console.error('Error getting web blocker config:', error);
      return defaultWebBlockerConfig;
    }
  },

  async setWebBlockerConfig(config: Partial<WebBlockerConfig>): Promise<void> {
    try {
      const current = await this.getWebBlockerConfig();
      const updated = { ...current, ...config };
      await AsyncStorage.setItem(STORAGE_KEYS.WEB_BLOCKER_CONFIG, JSON.stringify(updated));
    } catch (error) {
      console.error('Error setting web blocker config:', error);
    }
  },

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  },
};

export default StorageService;

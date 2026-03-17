import { useState, useEffect, useCallback } from 'react';
import { StorageService, BlockedApp } from '../services/StorageService';
import { AppBlocker } from '../modules/AppBlocker';

export interface UseBlockedAppsReturn {
  blockedApps: BlockedApp[];
  loading: boolean;
  error: string | null;
  addBlockedApp: (app: Omit<BlockedApp, 'blockedAt'>) => Promise<void>;
  removeBlockedApp: (packageName: string) => Promise<void>;
  isAppBlocked: (packageName: string) => boolean;
  toggleAppBlock: (app: Omit<BlockedApp, 'blockedAt'>) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useBlockedApps(): UseBlockedAppsReturn {
  const [blockedApps, setBlockedApps] = useState<BlockedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBlockedApps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const apps = await StorageService.getBlockedApps();
      setBlockedApps(apps);
      // Sync with native module on load
      await AppBlocker.setBlockedApps(apps.map((a) => a.packageName));
    } catch (err) {
      setError('Failed to load blocked apps');
      console.error('Error loading blocked apps:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlockedApps();
  }, [loadBlockedApps]);

  const addBlockedApp = useCallback(async (app: Omit<BlockedApp, 'blockedAt'>) => {
    try {
      await AppBlocker.blockApp(app.packageName);
      await StorageService.addBlockedApp(app);
      await loadBlockedApps();
    } catch (err) {
      setError('Failed to add blocked app');
      console.error('Error adding blocked app:', err);
    }
  }, [loadBlockedApps]);

  const removeBlockedApp = useCallback(async (packageName: string) => {
    try {
      await AppBlocker.unblockApp(packageName);
      await StorageService.removeBlockedApp(packageName);
      await loadBlockedApps();
    } catch (err) {
      setError('Failed to remove blocked app');
      console.error('Error removing blocked app:', err);
    }
  }, [loadBlockedApps]);

  const isAppBlocked = useCallback((packageName: string): boolean => {
    return blockedApps.some((app) => app.packageName === packageName);
  }, [blockedApps]);

  const toggleAppBlock = useCallback(async (app: Omit<BlockedApp, 'blockedAt'>) => {
    if (isAppBlocked(app.packageName)) {
      await removeBlockedApp(app.packageName);
    } else {
      await addBlockedApp(app);
    }
  }, [isAppBlocked, removeBlockedApp, addBlockedApp]);

  return {
    blockedApps,
    loading,
    error,
    addBlockedApp,
    removeBlockedApp,
    isAppBlocked,
    toggleAppBlock,
    refresh: loadBlockedApps,
  };
}

export default useBlockedApps;

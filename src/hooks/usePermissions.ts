import { useState, useEffect, useCallback } from 'react';
import { PermissionService, PermissionType, PermissionStatus } from '../services/PermissionService';

export interface UsePermissionsReturn {
  permissions: Record<PermissionType, PermissionStatus>;
  loading: boolean;
  checkPermission: (permission: PermissionType) => Promise<PermissionStatus>;
  requestPermission: (permission: PermissionType) => Promise<boolean>;
  hasMinimumPermissions: boolean;
  refresh: () => Promise<void>;
}

const defaultPermissions: Record<PermissionType, PermissionStatus> = {
  usageStats: { granted: false, canAskAgain: true },
  overlay: { granted: false, canAskAgain: true },
  accessibility: { granted: false, canAskAgain: true },
  deviceAdmin: { granted: false, canAskAgain: true },
};

export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<Record<PermissionType, PermissionStatus>>(defaultPermissions);
  const [loading, setLoading] = useState(true);
  const [hasMinimumPermissions, setHasMinimumPermissions] = useState(false);

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const results = await PermissionService.checkAllPermissions();
      setPermissions(results);

      const hasMin = await PermissionService.hasMinimumPermissions();
      setHasMinimumPermissions(hasMin);
    } catch (err) {
      console.error('Error loading permissions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const checkPermission = useCallback(async (permission: PermissionType): Promise<PermissionStatus> => {
    const status = await PermissionService.checkPermission(permission);
    setPermissions((prev) => ({
      ...prev,
      [permission]: status,
    }));
    return status;
  }, []);

  const requestPermission = useCallback(async (permission: PermissionType): Promise<boolean> => {
    const result = await PermissionService.requestPermission(permission);
    // Refresh permissions after request
    await loadPermissions();
    return result;
  }, [loadPermissions]);

  return {
    permissions,
    loading,
    checkPermission,
    requestPermission,
    hasMinimumPermissions,
    refresh: loadPermissions,
  };
}

export default usePermissions;

import { useState, useEffect } from 'react';
import { AppBlocker } from '../modules/AppBlocker';

const iconCache = new Map<string, string>();

export function useAppIcon(packageName: string): string {
  const [icon, setIcon] = useState(() => iconCache.get(packageName) ?? '');

  useEffect(() => {
    if (iconCache.has(packageName)) {
      setIcon(iconCache.get(packageName)!);
      return;
    }

    let cancelled = false;

    AppBlocker.getAppIcon(packageName).then((base64) => {
      if (!cancelled && base64) {
        iconCache.set(packageName, base64);
        setIcon(base64);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [packageName]);

  return icon;
}

export default useAppIcon;

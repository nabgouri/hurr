import { useState, useEffect, useCallback } from 'react';
import { StorageService, BlockedKeyword } from '../services/StorageService';
import { AppBlocker } from '../modules/AppBlocker';

export interface UseBlockedKeywordsReturn {
  blockedKeywords: BlockedKeyword[];
  loading: boolean;
  error: string | null;
  addBlockedKeyword: (keyword: string) => Promise<void>;
  removeBlockedKeyword: (id: string) => Promise<void>;
  isKeywordBlocked: (keyword: string) => boolean;
  refresh: () => Promise<void>;
}

export function useBlockedKeywords(): UseBlockedKeywordsReturn {
  const [blockedKeywords, setBlockedKeywords] = useState<BlockedKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncToNative = useCallback(async (keywords: BlockedKeyword[]) => {
    // Split into domains and keywords, sync both to native
    const domains: string[] = [];
    const keywordStrings: string[] = [];
    for (const k of keywords) {
      if (k.keyword.includes('.')) {
        domains.push(k.keyword);
      } else {
        keywordStrings.push(k.keyword);
      }
    }
    await Promise.all([
      AppBlocker.setBlockedKeywords(keywordStrings),
      AppBlocker.setBlockedDomains(domains),
    ]);
  }, []);

  const loadBlockedKeywords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const keywords = await StorageService.getBlockedKeywords();
      setBlockedKeywords(keywords);
      await syncToNative(keywords);
    } catch (err) {
      setError('Failed to load blocked keywords');
      console.error('Error loading blocked keywords:', err);
    } finally {
      setLoading(false);
    }
  }, [syncToNative]);

  useEffect(() => {
    loadBlockedKeywords();
  }, [loadBlockedKeywords]);

  const addBlockedKeyword = useCallback(async (keyword: string) => {
    try {
      await StorageService.addBlockedKeyword(keyword.toLowerCase().trim());
      await loadBlockedKeywords();
    } catch (err) {
      setError('Failed to add blocked keyword');
      console.error('Error adding blocked keyword:', err);
    }
  }, [loadBlockedKeywords]);

  const removeBlockedKeyword = useCallback(async (id: string) => {
    try {
      await StorageService.removeBlockedKeyword(id);
      await loadBlockedKeywords();
    } catch (err) {
      setError('Failed to remove blocked keyword');
      console.error('Error removing blocked keyword:', err);
    }
  }, [loadBlockedKeywords]);

  const isKeywordBlocked = useCallback((keyword: string): boolean => {
    return blockedKeywords.some((k) => k.keyword === keyword.toLowerCase().trim());
  }, [blockedKeywords]);

  return {
    blockedKeywords,
    loading,
    error,
    addBlockedKeyword,
    removeBlockedKeyword,
    isKeywordBlocked,
    refresh: loadBlockedKeywords,
  };
}

export default useBlockedKeywords;

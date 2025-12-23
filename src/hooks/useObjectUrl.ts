import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to manage Object URLs with automatic cleanup
 * Prevents memory leaks by revoking URLs when they're no longer needed
 */
export function useObjectUrlManager() {
  const urlsRef = useRef<Set<string>>(new Set());

  const createUrl = useCallback((blob: Blob): string => {
    const url = URL.createObjectURL(blob);
    urlsRef.current.add(url);
    return url;
  }, []);

  const revokeUrl = useCallback((url: string) => {
    if (url && urlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      urlsRef.current.delete(url);
    }
  }, []);

  const revokeAll = useCallback(() => {
    urlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });
    urlsRef.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      revokeAll();
    };
  }, [revokeAll]);

  return { createUrl, revokeUrl, revokeAll };
}

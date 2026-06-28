import { useEffect, useRef } from 'react';

export type SyncData<T = unknown> = {
  timestamp: number;
  data: T;
};

export function useBackgroundSync<T = unknown>(
  onSync: (data: SyncData<T>[]) => void,
  interval: number = 1000
) {
  const bufferRef = useRef<SyncData<T>[]>([]);
  const visibilityRef = useRef(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      visibilityRef.current = isVisible;

      if (isVisible && bufferRef.current.length > 0) {
        onSync(bufferRef.current);
        bufferRef.current = [];
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onSync]);

  const addToBuffer = (data: T) => {
    const syncData: SyncData<T> = {
      timestamp: Date.now(),
      data
    };

    if (visibilityRef.current) {
      onSync([syncData]);
    } else {
      bufferRef.current.push(syncData);
    }
  };

  return { addToBuffer };
}

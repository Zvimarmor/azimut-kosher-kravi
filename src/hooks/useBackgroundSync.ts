import { useEffect, useRef } from 'react';

export type SyncData = {
  timestamp: number;
  data: any;
};

export function useBackgroundSync(
  onSync: (data: SyncData[]) => void,
  interval: number = 1000
) {
  const bufferRef = useRef<SyncData[]>([]);
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

  const addToBuffer = (data: any) => {
    const syncData = {
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

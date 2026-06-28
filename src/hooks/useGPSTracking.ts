import { useState, useEffect, useCallback } from 'react';
import { gpsService, type GPSStats } from '../lib/services/gpsService';
import { useBackgroundSync } from './useBackgroundSync';

type GPSHookReturn = {
  gpsStats: GPSStats | null;
  isActive: boolean;
  hasPermission: boolean;
  initializeGPS: () => Promise<boolean>;
  stopGPS: () => GPSStats | null;
};

export function useGPSTracking(measurementSystem: 'metric' | 'imperial' = 'metric'): GPSHookReturn {
  const [gpsStats, setGPSStats] = useState<GPSStats | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const { addToBuffer } = useBackgroundSync<GPSStats>((syncData) => {
    // When app becomes visible, take the latest GPS stats from the buffer.
    // gpsService maintains correct cumulative totals internally, so we
    // simply use the most recent reading rather than summing (which would
    // inflate distance by adding cumulative values together).
    if (syncData.length > 0) {
      setGPSStats(syncData[syncData.length - 1].data);
    }
  });

  const initializeGPS = useCallback(async () => {
    if (!gpsService.isSupported()) {
      return false;
    }

    try {
      const permission = await gpsService.requestPermission();
      setHasPermission(permission);

      if (!permission) {
        return false;
      }

      gpsService.startTracking((stats) => {
        setGPSStats(stats);
        // Also add to background buffer
        addToBuffer(stats);
      }, measurementSystem);

      setIsActive(true);
      return true;
    } catch (error) {
      console.error('GPS initialization error:', error);
      return false;
    }
  }, [measurementSystem, addToBuffer]);

  const stopGPS = useCallback(() => {
    if (isActive) {
      const finalStats = gpsService.stopTracking();
      setGPSStats(finalStats);
      setIsActive(false);
      return finalStats;
    }
    return null;
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        stopGPS();
      }
    };
  }, [isActive, stopGPS]);

  return {
    gpsStats,
    isActive,
    hasPermission,
    initializeGPS,
    stopGPS
  };
}

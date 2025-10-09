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

  const { addToBuffer } = useBackgroundSync((syncData) => {
    // When app becomes visible, merge all buffered GPS data
    const gpsUpdates = syncData.map(item => item.data as GPSStats);
    
    if (gpsUpdates.length > 0) {
      const mergedStats = gpsUpdates.reduce((acc, curr) => ({
        ...curr,
        totalDistance: (acc.totalDistance || 0) + (curr.totalDistance || 0),
        // Average the pace
        averagePace: gpsUpdates.reduce((sum, stat) => sum + (stat.averagePace || 0), 0) / gpsUpdates.length
      }), {} as GPSStats);

      setGPSStats(prev => prev ? {
        ...prev,
        totalDistance: (prev.totalDistance || 0) + (mergedStats.totalDistance || 0),
        averagePace: Math.round(((prev.averagePace || 0) + (mergedStats.averagePace || 0)) / 2)
      } : mergedStats);
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

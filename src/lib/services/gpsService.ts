// GPS tracking service for running workouts

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GPSStats {
  totalDistance: number; // in meters
  averagePace: number; // in minutes per km (metric) or minutes per mile (imperial)
  currentSpeed: number; // in km/h (metric) or mph (imperial)
  duration: number; // in seconds
}

export type MeasurementSystem = 'metric' | 'imperial';

class GPSTrackingService {
  private watchId: number | null = null;
  private positions: GPSPosition[] = [];
  private startTime: number | null = null;
  private onUpdateCallback: ((stats: GPSStats) => void) | null = null;
  private isTracking: boolean = false;
  private measurementSystem: MeasurementSystem = 'metric';
  private permissionRequested: boolean = false;
  private hasPermission: boolean = false;
  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.saveCurrentData();
    } else {
      this.loadSavedData();
      // Update callback with restored data
      if (this.onUpdateCallback) {
        this.onUpdateCallback(this.getStats());
      }
    }
  };

  /**
   * Set the measurement system
   */
  setMeasurementSystem(system: MeasurementSystem): void {
    this.measurementSystem = system;
  }

  /**
   * Get the current measurement system
   */
  getMeasurementSystem(): MeasurementSystem {
    return this.measurementSystem;
  }

  /**
   * Convert meters to the appropriate distance unit
   */
  private convertDistance(meters: number): number {
    if (this.measurementSystem === 'imperial') {
      return meters * 0.000621371; // Convert to miles
    }
    return meters / 1000; // Convert to kilometers
  }

  /**
   * Convert m/s to the appropriate speed unit
   */
  private convertSpeed(metersPerSecond: number): number {
    if (this.measurementSystem === 'imperial') {
      return metersPerSecond * 2.23694; // Convert to mph
    }
    return metersPerSecond * 3.6; // Convert to km/h
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   * Returns distance in meters
   */
  private calculateDistance(pos1: GPSPosition, pos2: GPSPosition): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (pos1.latitude * Math.PI) / 180;
    const φ2 = (pos2.latitude * Math.PI) / 180;
    const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Calculate total distance from all recorded positions (in meters)
   */
  private getTotalDistanceMeters(): number {
    if (this.positions.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < this.positions.length; i++) {
      totalDistance += this.calculateDistance(this.positions[i - 1], this.positions[i]);
    }
    return totalDistance;
  }

  /**
   * Calculate pace from recent GPS data (interval-based)
   * Uses positions from the last 30 seconds for more accurate, real-time pace
   */
  private getIntervalPace(intervalSeconds: number = 30): number {
    if (this.positions.length < 2) return 0;

    const now = Date.now();
    const intervalMs = intervalSeconds * 1000;

    // Filter positions within the time interval
    const recentPositions = this.positions.filter(
      pos => (now - pos.timestamp) <= intervalMs
    );

    if (recentPositions.length < 2) {
      // Fall back to last 2 positions if not enough data in interval
      return this.getAveragePace();
    }

    // Calculate distance covered in the interval
    let intervalDistance = 0;
    for (let i = 1; i < recentPositions.length; i++) {
      intervalDistance += this.calculateDistance(
        recentPositions[i - 1],
        recentPositions[i]
      );
    }

    // Calculate time span of the interval
    const intervalDuration =
      (recentPositions[recentPositions.length - 1].timestamp - recentPositions[0].timestamp) / 1000;

    if (intervalDistance === 0 || intervalDuration === 0) return 0;

    // Convert to display units and calculate pace
    const distance = this.convertDistance(intervalDistance);
    const durationMinutes = intervalDuration / 60;

    return durationMinutes / distance; // min/km or min/mile
  }

  /**
   * Calculate average pace in minutes per km/mile (total average - fallback)
   */
  private getAveragePace(): number {
    const distanceMeters = this.getTotalDistanceMeters();
    const duration = this.getDuration();

    if (distanceMeters === 0 || duration === 0) return 0;

    const distance = this.convertDistance(distanceMeters);
    const durationMinutes = duration / 60;

    return durationMinutes / distance; // min/km or min/mile
  }

  /**
   * Calculate current speed in km/h or mph
   */
  private getCurrentSpeed(): number {
    if (this.positions.length < 2) return 0;

    const lastTwo = this.positions.slice(-2);
    const distanceMeters = this.calculateDistance(lastTwo[0], lastTwo[1]);
    const timeDiff = (lastTwo[1].timestamp - lastTwo[0].timestamp) / 1000; // in seconds

    if (timeDiff === 0) return 0;

    const speedMs = distanceMeters / timeDiff; // m/s
    return this.convertSpeed(speedMs);
  }

  /**
   * Get duration in seconds
   */
  private getDuration(): number {
    if (!this.startTime) return 0;
    return (Date.now() - this.startTime) / 1000;
  }

  /**
   * Get current GPS stats
   */
  private getStats(): GPSStats {
    return {
      totalDistance: this.getTotalDistanceMeters(),
      averagePace: this.getIntervalPace(30), // Use 30-second interval for real-time pace
      currentSpeed: this.getCurrentSpeed(),
      duration: this.getDuration()
    };
  }

  /**
   * Handle position update from GPS
   */
  private handlePosition = (position: GeolocationPosition) => {
    const gpsPosition: GPSPosition = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    };

    // Only add position if accuracy is reasonable (within 50 meters)
    if (gpsPosition.accuracy <= 50) {
      this.positions.push(gpsPosition);

      // Notify callback with updated stats
      if (this.onUpdateCallback) {
        this.onUpdateCallback(this.getStats());
      }
    } else {
      console.warn('GPS accuracy too low, skipping position:', gpsPosition.accuracy);
    }
  };

  /**
   * Handle GPS error
   */
  private handleError = (error: GeolocationPositionError) => {
    console.error('GPS error:', error.message);

    switch (error.code) {
      case error.PERMISSION_DENIED:
        throw new Error('Location permission denied. Please enable location access.');
      case error.POSITION_UNAVAILABLE:
        throw new Error('Location information unavailable.');
      case error.TIMEOUT:
        throw new Error('Location request timed out.');
      default:
        throw new Error('Unknown GPS error occurred.');
    }
  };

  /**
   * Check if GPS tracking is supported
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Request location permission
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by this browser.');
    }

    // If we've already checked permission in this session, return cached result
    if (this.permissionRequested) {
      return this.hasPermission;
    }

    try {
      // Try to get current position to trigger permission request
      // Increased timeout for mobile devices, especially indoors
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 30000, // Increased from 10s to 30s for mobile
          maximumAge: 0
        });
      });

      this.permissionRequested = true;
      this.hasPermission = true;
      return true;
    } catch (error: any) {
      this.permissionRequested = true;
      if (error.code === 1) {
        // Permission denied
        this.hasPermission = false;
        return false;
      }
      // For timeout or position unavailable, still set permission as true if not denied
      // The user may have granted permission but signal is weak
      if (error.code === 2 || error.code === 3) {
        console.warn('GPS signal weak or timeout, but permission may be granted:', error.message);
        this.hasPermission = true;
        this.permissionRequested = true;
        return true;
      }
      throw error;
    }
  }

  /**
   * Load saved GPS data from storage
   */
  loadSavedData(): void {
    try {
      const savedData = localStorage.getItem('gps_buffer');
      if (savedData) {
        const { positions, startTime, measurementSystem } = JSON.parse(savedData);
        if (positions && positions.length > 0) {
          this.positions = positions;
          this.startTime = startTime || Date.now();
          if (measurementSystem) {
            this.measurementSystem = measurementSystem;
          }
          console.log('Restored GPS data from storage:', {
            positions: positions.length,
            startTime: new Date(startTime).toISOString()
          });
        }
        localStorage.removeItem('gps_buffer');
      }
    } catch (error) {
      console.error('Error loading saved GPS data:', error);
    }
  }

  /**
   * Save current GPS data to storage
   */
  saveCurrentData(): void {
    try {
      localStorage.setItem('gps_buffer', JSON.stringify({
        positions: this.positions,
        startTime: this.startTime,
        measurementSystem: this.measurementSystem
      }));
    } catch (error) {
      console.error('Error saving GPS data:', error);
    }
  }

  /**
   * Start GPS tracking
   */
  startTracking(onUpdate: (stats: GPSStats) => void, measurementSystem?: MeasurementSystem): void {
    if (this.isTracking) {
      console.warn('GPS tracking already started');
      return;
    }

    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by this browser.');
    }

    if (measurementSystem) {
      this.measurementSystem = measurementSystem;
    }

    // Try to restore any saved data before starting new tracking
    this.loadSavedData();

    this.isTracking = true;
    if (!this.startTime) {
      this.startTime = Date.now();
    }
    this.onUpdateCallback = onUpdate;

    // Set up visibility change handler
    const handleVisibilityChange = () => {
      if (document.hidden) {
        this.saveCurrentData();
      } else {
        this.loadSavedData();
        // Update callback with restored data
        if (this.onUpdateCallback) {
          this.onUpdateCallback(this.getStats());
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start watching position with high accuracy
    // Increased timeout for better mobile support, especially indoors
    this.watchId = navigator.geolocation.watchPosition(
      this.handlePosition,
      this.handleError,
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased from 5s to 15s for mobile devices
        maximumAge: 0
      }
    );

    console.log('GPS tracking started with', this.measurementSystem, 'units');
  }

  /**
   * Stop GPS tracking and return final stats
   */
  stopTracking(): GPSStats {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.isTracking = false;
    const finalStats = this.getStats();

    // Clean up visibility change listener
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    // Clean up stored data
    try {
      localStorage.removeItem('gps_buffer');
    } catch (error) {
      console.error('Error clearing GPS buffer:', error);
    }

    console.log('GPS tracking stopped. Final stats:', finalStats);
    console.log('Total positions recorded:', this.positions.length);

    // Reset positions and startTime to prevent accumulation across workouts
    this.positions = [];
    this.startTime = null;

    return finalStats;
  }

  /**
   * Reset tracking data and permission state
   */
  reset(): void {
    this.stopTracking();
    this.positions = [];
    this.startTime = null;
    this.onUpdateCallback = null;
    this.permissionRequested = false;
    this.hasPermission = false;
    
    // Clear stored data
    try {
      localStorage.removeItem('gps_buffer');
    } catch (error) {
      console.error('Error clearing GPS buffer:', error);
    }
  }

  /**
   * Get current tracking status
   */
  getIsTracking(): boolean {
    return this.isTracking;
  }

  /**
   * Get all recorded positions (for debugging or route display)
   */
  getPositions(): GPSPosition[] {
    return [...this.positions];
  }

  /**
   * Format distance for display
   */
  formatDistance(meters: number): string {
    const distance = this.convertDistance(meters);
    const unit = this.measurementSystem === 'metric' ? 'km' : 'mi';
    return `${distance.toFixed(2)} ${unit}`;
  }

  /**
   * Format pace for display
   */
  formatPace(minutesPerUnit: number): string {
    if (minutesPerUnit === 0 || !isFinite(minutesPerUnit)) return '--:--';

    const minutes = Math.floor(minutesPerUnit);
    const seconds = Math.floor((minutesPerUnit - minutes) * 60);
    const unit = this.measurementSystem === 'metric' ? 'km' : 'mi';

    return `${minutes}:${seconds.toString().padStart(2, '0')}/${unit}`;
  }

  /**
   * Format speed for display
   */
  formatSpeed(speed: number): string {
    const unit = this.measurementSystem === 'metric' ? 'km/h' : 'mph';
    return `${speed.toFixed(1)} ${unit}`;
  }
}

// Export singleton instance
export const gpsService = new GPSTrackingService();

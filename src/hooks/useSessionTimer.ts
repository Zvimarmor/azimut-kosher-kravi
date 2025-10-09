import { useState, useEffect, useCallback, useRef } from 'react';

interface TimerState {
  startTime: number | null;
  totalTime: number;
  isRunning: boolean;
  lastPauseTime: number | null;
  pauses: Array<{ start: number; end: number }>;
}

/**
 * Hook for tracking session time with pause detection
 * Accounts for:
 * - Page visibility changes (tab switching, minimizing)
 * - Device sleep/wake
 * - Manual pauses
 */
export function useSessionTimer() {
  const [state, setState] = useState<TimerState>({
    startTime: null,
    totalTime: 0,
    isRunning: false,
    lastPauseTime: null,
    pauses: []
  });

  // Store last active timestamp to detect long interruptions
  const lastActiveRef = useRef(Date.now());
  const PAUSE_THRESHOLD = 1000; // Consider gaps > 1s as pauses

  // Update active timestamp periodically while running
  useEffect(() => {
    if (!state.isRunning) return;

    const interval = setInterval(() => {
      lastActiveRef.current = Date.now();
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isRunning]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.hidden) {
        // Page is being hidden - record pause start
        if (state.isRunning) {
          setState(prev => ({
            ...prev,
            lastPauseTime: now
          }));
        }
      } else {
        // Page is becoming visible - check if we need to record a pause
        if (state.isRunning && state.lastPauseTime) {
          const pauseDuration = now - state.lastPauseTime;
          if (pauseDuration >= PAUSE_THRESHOLD) {
            setState(prev => ({
              ...prev,
              lastPauseTime: null,
              pauses: [...prev.pauses, { start: prev.lastPauseTime!, end: now }]
            }));
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isRunning, state.lastPauseTime]);

  // Handle page hide/show (mobile browsers, sleep/wake)
  useEffect(() => {
    const handlePageHide = () => {
      if (state.isRunning) {
        setState(prev => ({
          ...prev,
          lastPauseTime: Date.now()
        }));
      }
    };

    const handlePageShow = () => {
      const now = Date.now();
      if (state.isRunning && state.lastPauseTime) {
        const pauseDuration = now - state.lastPauseTime;
        if (pauseDuration >= PAUSE_THRESHOLD) {
          setState(prev => ({
            ...prev,
            lastPauseTime: null,
            pauses: [...prev.pauses, { start: prev.lastPauseTime!, end: now }]
          }));
        }
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [state.isRunning, state.lastPauseTime]);

  // Check for long gaps in activity
  useEffect(() => {
    if (!state.isRunning) return;

    const checkActivity = () => {
      const now = Date.now();
      const timeSinceActive = now - lastActiveRef.current;
      
      if (timeSinceActive >= PAUSE_THRESHOLD) {
        setState(prev => ({
          ...prev,
          pauses: [...prev.pauses, { start: lastActiveRef.current, end: now }]
        }));
      }
      
      lastActiveRef.current = now;
    };

    const interval = setInterval(checkActivity, 1000);
    return () => clearInterval(interval);
  }, [state.isRunning]);

  // Start the timer
  const start = useCallback(() => {
    const now = Date.now();
    setState(prev => ({
      ...prev,
      startTime: now,
      isRunning: true,
      lastPauseTime: null
    }));
    lastActiveRef.current = now;
  }, []);

  // Stop the timer
  const stop = useCallback(() => {
    const now = Date.now();
    if (!state.startTime) return 0;

    // Calculate total time excluding pauses
    const rawDuration = now - state.startTime;
    const pauseDuration = state.pauses.reduce((total, pause) => {
      return total + (pause.end - pause.start);
    }, 0);

    // Add final pause if exists
    const finalPauseDuration = state.lastPauseTime ? (now - state.lastPauseTime) : 0;
    const totalDuration = Math.max(0, rawDuration - pauseDuration - finalPauseDuration);

    setState(prev => ({
      ...prev,
      isRunning: false,
      totalTime: totalDuration
    }));

    return totalDuration;
  }, [state.startTime, state.pauses, state.lastPauseTime]);

  // Get current elapsed time
  const getElapsedTime = useCallback(() => {
    if (!state.startTime || !state.isRunning) return state.totalTime;

    const now = Date.now();
    const rawDuration = now - state.startTime;
    
    // Calculate pause duration
    const pauseDuration = state.pauses.reduce((total, pause) => {
      return total + (pause.end - pause.start);
    }, 0);

    // Add current pause if exists
    const currentPauseDuration = state.lastPauseTime ? (now - state.lastPauseTime) : 0;

    return Math.max(0, rawDuration - pauseDuration - currentPauseDuration);
  }, [state.startTime, state.isRunning, state.pauses, state.lastPauseTime, state.totalTime]);

  return {
    start,
    stop,
    getElapsedTime,
    isRunning: state.isRunning
  };
}

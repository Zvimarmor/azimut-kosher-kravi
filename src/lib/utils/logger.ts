/**
 * Secure Logging Utility
 *
 * Provides conditional logging that respects environment settings.
 * Prevents sensitive information leakage in production.
 */

const isDevelopment = import.meta.env.VITE_ENV === 'development' || import.meta.env.DEV;

// Persistent log storage for debugging auth redirects
const AUTH_LOG_KEY = 'auth_debug_logs';
const MAX_LOGS = 100;

interface LogEntry {
  timestamp: string;
  type: 'log' | 'error' | 'warn' | 'info' | 'debug';
  message: string;
}

const persistLog = (type: LogEntry['type'], ...args: any[]) => {
  try {
    const logs = JSON.parse(localStorage.getItem(AUTH_LOG_KEY) || '[]') as LogEntry[];

    const message = args.map(arg => {
      if (typeof arg === 'string') return arg;
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type,
      message
    };

    logs.push(entry);

    // Keep only last MAX_LOGS entries
    if (logs.length > MAX_LOGS) {
      logs.shift();
    }

    localStorage.setItem(AUTH_LOG_KEY, JSON.stringify(logs));
  } catch (e) {
    // Silent fail if localStorage is full
  }
};

/**
 * Console logger with environment-aware behavior
 */
export const logger = {
  /**
   * Log informational messages
   * Only logs in development environment
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
      persistLog('log', ...args);
    }
  },

  /**
   * Log debug messages
   * Only logs in development environment
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
      persistLog('debug', ...args);
    }
  },

  /**
   * Log warning messages
   * Logs in all environments
   */
  warn: (...args: any[]) => {
    console.warn(...args);
    persistLog('warn', ...args);
  },

  /**
   * Log error messages
   * Logs in all environments
   */
  error: (...args: any[]) => {
    console.error(...args);
    persistLog('error', ...args);
  },

  /**
   * Log info messages
   * Only logs in development environment
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
      persistLog('info', ...args);
    }
  },

  /**
   * Get all persisted logs
   */
  getLogs: (): LogEntry[] => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_LOG_KEY) || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Clear all persisted logs
   */
  clearLogs: () => {
    localStorage.removeItem(AUTH_LOG_KEY);
    console.log('Auth debug logs cleared');
  },

  /**
   * Print all persisted logs to console
   */
  printLogs: () => {
    const logs = logger.getLogs();
    console.log('========== PERSISTED AUTH LOGS ==========');
    console.log(`Total logs: ${logs.length}`);
    logs.forEach(log => {
      const timeStr = new Date(log.timestamp).toLocaleTimeString();
      const emoji = log.type === 'error' ? '❌' : log.type === 'warn' ? '⚠️' : '📝';
      console.log(`${emoji} [${timeStr}] ${log.message}`);
    });
    console.log('=========================================');
    console.log('Tip: Use logger.clearLogs() to clear these logs');
  }
};

/**
 * Sanitize sensitive data from objects before logging
 * Removes or masks common sensitive fields
 */
export function sanitizeForLogging(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sensitiveKeys = [
    'password',
    'token',
    'apiKey',
    'api_key',
    'secret',
    'authorization',
    'accessToken',
    'access_token',
    'refreshToken',
    'refresh_token',
    'sessionId',
    'session_id',
  ];

  const sanitized = { ...obj };

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }

  return sanitized;
}

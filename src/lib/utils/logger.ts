/**
 * Secure Logging Utility
 *
 * Provides conditional logging that respects environment settings.
 * Prevents sensitive information leakage in production.
 */

const isDevelopment = import.meta.env.VITE_ENV === 'development' || import.meta.env.DEV;

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
    }
  },

  /**
   * Log debug messages
   * Only logs in development environment
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log warning messages
   * Logs in all environments
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  },

  /**
   * Log error messages
   * Logs in all environments
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log info messages
   * Only logs in development environment
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
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

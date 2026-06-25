/**
 * Extension logger — wraps console with level filtering.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LEVEL: LogLevel = import.meta.env.DEV ? 'debug' : 'warn';
const PREFIX = '[Wingman AI]';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL];
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) console.debug(PREFIX, ...args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) console.info(PREFIX, ...args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) console.warn(PREFIX, ...args);
  },
  error: (...args: unknown[]) => {
    if (shouldLog('error')) console.error(PREFIX, ...args);
  },
};

import { BuilderLogLevelType } from './models';
import { blue, green, yellow, red } from 'colorette';

export type Logger = {
  verbose: (msg: string) => void;
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
};

const logLevelMap = {
  off: -1,
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
};

/* c8 ignore start */
export function createLogger(logLevel: BuilderLogLevelType = 'error'): Logger {
  const log = (msg: string) => console.log(`${msg}`);

  const mappedLogLevel = mapLogLevel(logLevel);

  const verbose = (msg: string) => mappedLogLevel >= logLevelMap.verbose && log(blue(msg));
  const info = (msg: string) => mappedLogLevel >= logLevelMap.info && log(green(msg));
  const warn = (msg: string) => mappedLogLevel >= logLevelMap.warn && log(yellow(msg));
  const error = (msg: string) => mappedLogLevel >= logLevelMap.error && log(red(msg));

  return { verbose, info, warn, error };
}

function mapLogLevel(logLevel: BuilderLogLevelType) {
  return logLevelMap[logLevel] || 0;
}
/* c8 ignore stop */

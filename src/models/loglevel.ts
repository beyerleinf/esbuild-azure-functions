/* eslint-disable @typescript-eslint/no-explicit-any */

export enum BuilderLogLevel {
  verbose = 'verbose',
  info = 'info',
  warn = 'warn',
  error = 'error',
}

export function isBuilderLogLevel(arg: any): arg is BuilderLogLevel {
  return typeof arg === 'string' && Object.values(BuilderLogLevel).includes(arg as BuilderLogLevel);
}

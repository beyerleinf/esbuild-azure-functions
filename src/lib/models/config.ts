/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from 'zod';

const BuilderLogLevel = z.enum(['verbose', 'info', 'warn', 'error']);

export const BuilderConfig = z.object({
  project: z.string(),
  entryPoints: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
  esbuildOptions: z.any().optional(),
  clean: z.boolean().optional(),
  logLevel: BuilderLogLevel.optional(),
});

export type BuilderConfigType = z.infer<typeof BuilderConfig>;
export type BuilderLogLevelType = z.infer<typeof BuilderLogLevel>;

// export interface BuilderConfig {
//   project: string;
//   entryPoints?: string[];
//   exclude?: string[];
//   esbuildOptions?: BuildOptions;
//   clean?: boolean;
//   loglevel?: BuilderLogLevel;
// }

// export function isBuilderConfig(arg: any): arg is BuilderConfig {
//   return (
//     arg !== null &&
//     arg !== undefined &&
//     typeof arg.project === 'string' &&
//     (!arg.entryPoints ||
//       (Array.isArray(arg.entryPoints) && arg.entryPoints.every((x: any) => typeof x === 'string'))) &&
//     (!arg.exclude || (Array.isArray(arg.exclude) && arg.exclude.every((x: any) => typeof x === 'string'))) &&
//     (!arg.clean || typeof arg.clean === 'boolean') &&
//     isBuilderLogLevel(arg.loglevel)
//   );
// }

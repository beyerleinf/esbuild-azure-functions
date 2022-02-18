/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from 'zod';

const BuilderLogLevel = z.enum(['verbose', 'info', 'warn', 'error', 'off']);

const EsbuildOptions = z.any();

const AdvancedBuilderOptions = z.object({
  enableDirnameShim: z.boolean(),
});

export const BuilderConfig = z.object({
  project: z.string(),
  entryPoints: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
  esbuildOptions: EsbuildOptions.optional(),
  clean: z.boolean().optional(),
  logLevel: BuilderLogLevel.optional(),
  advancedOptions: AdvancedBuilderOptions.optional(),
});

export type BuilderConfigType = z.infer<typeof BuilderConfig>;
export type BuilderLogLevelType = z.infer<typeof BuilderLogLevel>;
export type AdvancedBuilderOptionsType = z.infer<typeof AdvancedBuilderOptions>;

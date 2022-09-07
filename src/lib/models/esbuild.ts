import { z } from 'zod';

export const Location = z.object({
  file: z.string(),
  namespace: z.string(),
  line: z.number(),
  column: z.number(),
  length: z.number(),
  lineText: z.string(),
  suggestion: z.string(),
});

export const Note = z.object({
  text: z.string(),
  location: Location.nullable(),
});

export const Message = z.object({
  pluginName: z.string(),
  text: z.string(),
  location: Location.nullable(),
  notes: z.array(Note),
  detail: z.any().optional(),
});

export const OutputFile = z.object({
  path: z.string(),
  contents: z.any(),
  text: z.string(),
});

export const BuildFailure = z.object({
  errors: z.array(Message),
  warnings: z.array(Message),
});

export const BuildResult = z.object({
  errors: z.array(Message),
  warnings: z.array(Message),
  outputFiles: z.array(OutputFile).optional(),
  rebuild: z.function(z.tuple([]), z.any()).optional(),
  stop: z.function(z.tuple([])).optional(),
  metafile: z.any().optional(),
  mangleCache: z.any().optional(),
});

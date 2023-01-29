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

export const OutputFile = z.object({
  path: z.string(),
  contents: z.any(),
  text: z.string(),
});

export const ImportKind = z.union([
  z.literal('entry-point'),
  z.literal('import-statement'),
  z.literal('require-call'),
  z.literal('dynamic-import'),
  z.literal('require-resolve'),
  z.literal('import-rule'),
  z.literal('url-token'),
]);

export const Metafile = z.object({
  inputs: z.record(
    z.object({
      bytes: z.number(),
      imports: z.array(
        z.object({
          path: z.string(),
          kind: ImportKind,
          external: z.boolean().optional(),
          original: z.string().optional(),
        })
      ),
      format: z.union([z.literal('cjs'), z.literal('esm')]).optional(),
    })
  ),
  outputs: z.record(
    z.object({
      bytes: z.number(),
      inputs: z.record(
        z.object({
          bytesInOutput: z.number(),
        })
      ),
      imports: z.array(
        z.object({
          path: z.string(),
          kind: z.union([ImportKind, z.literal('file-loader')]),
          external: z.boolean().optional(),
        })
      ),
      exports: z.array(z.string()),
      entryPoint: z.string().optional(),
      cssBundle: z.string().optional(),
    })
  ),
});

export const Note = z.object({
  text: z.string(),
  location: Location.nullable(),
});

export const Message = z.object({
  id: z.string(),
  pluginName: z.string(),
  text: z.string(),
  location: Location.nullable(),
  notes: z.array(Note),
  detail: z.any(),
});

export const BuildResult = z.object({
  errors: z.array(Message),
  warnings: z.array(Message),
  outputFiles: z.union([z.array(OutputFile), z.any()]),
  metafile: z.union([Metafile, z.any()]),
  mangleCache: z.union([z.record(z.union([z.string(), z.literal(false)])), z.any()]),
});

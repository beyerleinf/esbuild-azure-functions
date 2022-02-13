import { promises as fs } from 'fs';
import { FileSystemError, InvalidConfigError, InvalidJSONError } from './errors';
import { BuilderConfig } from './models/config';

export async function loadConfig(file: string): Promise<unknown> {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new InvalidJSONError(file);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new FileSystemError(file, (error as any).code);
    }
  }
}

export function parseConfig(config: unknown) {
  const parsed = BuilderConfig.safeParse(config);

  if (parsed.success === false) {
    throw new InvalidConfigError(parsed.error);
  } else {
    return parsed.data;
  }
}

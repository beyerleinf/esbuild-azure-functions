import { red } from 'colorette';

export class NoEntryPointsError extends Error {
  constructor(dir: string) {
    super(
      red(`
      The project directory "${dir}" did not contain any entry points and none were supplied.
      Make sure your project contains at least one index.ts file
      or supply entry points manually through config.entryPoints.`)
    );

    this.name = NoEntryPointsError.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

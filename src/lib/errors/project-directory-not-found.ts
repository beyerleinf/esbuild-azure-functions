import { red } from 'colorette';

export class ProjectDirectoryNotFoundError extends Error {
  constructor(dir: string) {
    super(red(`The project directory "${dir}" could not be found.`));

    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

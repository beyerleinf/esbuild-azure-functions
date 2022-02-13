import { red } from 'colorette';

export class FileSystemError extends Error {
  constructor(file: string, code: string) {
    super(red(`An error occurred while accessing "${file}": ${code}.`));

    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

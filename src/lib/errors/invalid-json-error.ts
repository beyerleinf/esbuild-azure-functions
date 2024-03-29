import { red } from 'colorette';

export class InvalidJSONError extends Error {
  constructor(file: string) {
    super(red(`The config file "${file}" does not contain valid JSON.`));

    this.name = InvalidJSONError.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

import { red } from 'colorette';
import { ZodError, ZodIssue } from 'zod';

export class InvalidConfigError extends Error {
  constructor(zodError: ZodError) {
    super(
      red(
        `\nThe config file is invalid. Check the following properties for validity:\n${zodError.issues
          .map(mapZodIssueToMessage)
          .join('\n')}\n`
      )
    );

    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

function mapZodIssueToMessage(issue: ZodIssue) {
  if (issue.code === 'invalid_type') {
    return `- ${issue.path.join('.')}: Expected ${issue.expected} but received ${issue.received}`;
  } else {
    return `- ${issue.path.join('.')}`;
  }
}

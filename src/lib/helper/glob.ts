import globber from 'glob';

/* c8 ignore start */
export function glob(pattern: string, options: globber.IOptions) {
  return new Promise<string[]>((resolve, reject) => {
    globber(pattern, options, (err, matches) => {
      if (err) return reject(err);

      return resolve(matches);
    });
  });
}
/* c8 ignore stop */

import rimraffer from 'rimraf';

/* c8 ignore start */
export function rimraf(path: string) {
  return new Promise<void>((resolve, reject) => {
    rimraffer(path, err => {
      if (err) return reject(err);

      resolve();
    });
  });
}
/* c8 ignore stop */

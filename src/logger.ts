import chalk from 'chalk';

export const logger = {
  info: (msg: string) => console.log(chalk.blue(msg)),
  warn: (msg: string) => console.log(chalk.yellow(msg)),
  error: (msg: string) => console.log(chalk.red(msg)),
};

export const createLogger = () => {
  const log = (msg: string) => console.log(`${msg}`);

  const verbose = (msg: string) => log(chalk.blue(msg));
  const info = (msg: string) => log(chalk.green(msg));
  const warn = (msg: string) => log(chalk.yellow(msg));
  const error = (msg: string) => log(chalk.red(msg));

  return { verbose, info, warn, error };
};

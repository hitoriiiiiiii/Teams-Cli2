import ora from 'ora';
import chalk from 'chalk';

export function startSpinner(
  text: string,
  color: 'cyan' | 'blue' | 'green' | 'yellow' = 'cyan',
) {
  return ora({
    text: chalk[color](text),
    spinner: {
      interval: 80,
      frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    },
  }).start();
}

export function successSpinner(text: string, finalText?: string) {
  const spinner = ora(chalk.cyan(text)).start();
  setTimeout(() => {
    spinner.succeed(chalk.green.bold(finalText || text));
  }, 500);
  return spinner;
}

export function errorSpinner(text: string, errorText?: string) {
  const spinner = ora(chalk.cyan(text)).start();
  setTimeout(() => {
    spinner.fail(chalk.red.bold(errorText || text));
  }, 500);
  return spinner;
}

export function warnSpinner(text: string, warnText?: string) {
  const spinner = ora(chalk.cyan(text)).start();
  setTimeout(() => {
    spinner.warn(chalk.yellow.bold(warnText || text));
  }, 500);
  return spinner;
}

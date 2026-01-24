import chalk from 'chalk';

export const logger = {
  success: (message: string) => {
    console.log(chalk.green.bold('✅ ') + chalk.green(message));
  },

  error: (message: string) => {
    console.log(chalk.red.bold('❌ ') + chalk.red(message));
  },

  info: (message: string) => {
    console.log(chalk.blue.bold('ℹ️  ') + chalk.blue(message));
  },

  warning: (message: string) => {
    console.log(chalk.yellow.bold('⚠️  ') + chalk.yellow(message));
  },

  title: (message: string) => {
    console.log('\n' + chalk.cyan.bold.underline(message) + '\n');
  },

  header: (message: string) => {
    const padding = '═'.repeat(message.length + 4);
    console.log(chalk.magenta(padding));
    console.log(
      chalk.magenta('║ ') + chalk.magenta.bold(message) + chalk.magenta(' ║'),
    );
    console.log(chalk.magenta(padding));
  },

  highlight: (
    message: string,
    color: 'cyan' | 'yellow' | 'green' | 'blue' = 'cyan',
  ) => {
    console.log(chalk[color].bold(message));
  },

  list: (items: string[]) => {
    items.forEach((item) => {
      console.log(chalk.cyan('  • ') + chalk.white(item));
    });
  },

  table: (headers: string[], rows: string[][]) => {
    const headerLine = headers
      .map((h) => chalk.cyan.bold(h))
      .join(chalk.gray(' | '));
    console.log(headerLine);
    console.log(chalk.gray('─'.repeat(headerLine.length)));
    rows.forEach((row) => {
      console.log(row.map((cell) => chalk.white(cell)).join(chalk.gray(' | ')));
    });
  },

  dim: (message: string) => {
    console.log(chalk.dim(message));
  },
};

var chalk = require('chalk');

// style a string
console.log(chalk.blue('Hello world!'));

// combine styled and normal strings
console.log(chalk.blue('Hello') + 'World' + chalk.red('!'));

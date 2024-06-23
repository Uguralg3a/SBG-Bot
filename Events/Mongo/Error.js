const chalk = require('chalk')

module.exports = {
    name: 'err',
    execute(err) {
        console.log(chalk.red(`An error ercured with the database connection: ${err}`));
    }
}
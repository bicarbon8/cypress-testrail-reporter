const chalk = require('chalk');

module.exports = {
    log: (text) => {
        console.log('\n', chalk.default.magenta.underline.bold('(TestRail Reporter)'));
        console.log('\n', ' - ' + text, '\n');
    },
    warn: (text) => {
        console.log('\n', chalk.default.magenta.underline.bold('(TestRail Reporter)'));
        console.warn('\n', ' - ' + text, '\n');
    }
}
const chalk = require('chalk');

const TestRailLogger = {
    log: (text) => {
        TestRailLogger.out('info', text);
    },
    warn: (text) => {
        TestRailLogger.out('warn', text);
    },
    error: (text) => {
        TestRailLogger.out('error', text);
    },
    out: (level, text) => {
        console.log('\n', chalk.default.magenta.underline.bold('(TestRail Reporter)'));
        switch (level) {
            case 'error':
                console.error(`\n${text}\n`);
                break;
            case 'warn':
                console.warn(`\n${text}\n`);
                break;
            default:
                console.log(`\n${text}\n`);
        }
    }
}

module.exports = TestRailLogger;
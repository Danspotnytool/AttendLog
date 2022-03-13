
const fs = require('fs');

let index = 0;

// Create an object that has functions that would return strings that has colors for terminal
const logger = {
    green: (str) => {
        return `\x1b[32m${str}\x1b[0m`;
    },
    blue: (str) => {
        return `\x1b[34m${str}\x1b[0m`;
    },
    red: (str) => {
        return `\x1b[31m${str}\x1b[0m`;
    },
    getTime: (withColor) => {
        const time = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Manila',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });
        if (!withColor) {
            return `${time} PHT`;
        };
        return `${logger.blue(`${time} PHT`)}`;
    },
    write: (message) => {
        // Check if the file exists
        if (!fs.existsSync('../logs.txt')) {
            fs.writeFileSync('../logs.txt', '');
        };
        const file = `${__dirname}/../logs.txt`;
        fs.appendFile(file, `${message}\n`, (err) => {
            if (err) {
                throw err;
            };
        });
    },
    log: (message) => {
        console.log(`[${logger.green(`${index}`)}] [${logger.getTime(true)}] ${message}`);
        logger.write(`[${index}] [${logger.getTime(false)}] [LOG] ${message}`);
        index += 1;
    },
    error: (message) => {
        console.log(`[${logger.green(`${index}`)}] [${logger.getTime(true)}] ${logger.red(message)}`);
        logger.write(`[${index}] [${logger.getTime(false)}] [ERROR] ${message}`);
        index += 1;
    }
};

module.exports = logger;

let index = 0;

// Create an object that has functions that would return strings that has colors for terminal
const logger = {
    green: (str) => {
        return `\x1b[32m${str}\x1b[0m`;
    },
    red: (str) => {
        return `\x1b[31m${str}\x1b[0m`;
    },
    yellow: (str) => {
        return `\x1b[33m${str}\x1b[0m`;
    },
    blue: (str) => {
        return `\x1b[34m${str}\x1b[0m`;
    },
    index : () => {
        index += 1;
        return `[${index - 1}]`;
    },
    time: () => {
        // PHT timezone
        const date = new Date();
        const time = date.toLocaleTimeString('en-US', {
            timeZone: 'Asia/Manila',
            hour12: false,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        });
        return time;
    }
};

module.exports = logger;
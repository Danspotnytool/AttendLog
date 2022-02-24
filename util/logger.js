// Create an object that has functions that would return strings that has colors for terminal
module.exports = {
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
    }
};
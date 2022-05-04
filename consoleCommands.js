
// Require dependencies and utilities
const { database } = require('./util/databaseConnection.js');
const logger = require('./util/logger.js');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const { urlencoded } = require('express');

module.exports = (server) => {
    // Listen to console commands
    process.stdin.on('data', (data) => {
        const key = data.toString().trim();
        switch (key) {
            case 'exit':
                logger.log('Exiting...');
                process.exit();
                break;

            // case 'restart':
            //     logger.log('Restarting...');

            //     const mainServer = `${__dirname.split('\\').slice(0, -1).join('\\')}\\main.js`.replaceAll(' ', '%20');

            //     server.close(() => {
            //         logger.log('Server closed');
            //         exec('node ' + 'main.js', (err, stdout, stderr) => {
            //             if (err) {
            //                 logger.error(err);
            //             } else {
            //                 logger.log(stdout);
            //                 process.exit();
            //             };
            //         });
            //     });
            //     break;

            case 'purge':
                logger.log('Purging database...');
                database.ref('/').remove().then(async () => {
                    // Create all tables with placeholder = true
                    await database.ref('/classes').set({
                        placeholder: true
                    });
                    await database.ref('/emails').set({
                        placeholder: true
                    });
                    await database.ref('/usernames').set({
                        placeholder: true
                    });
                    await database.ref('/users').set({
                        placeholder: true
                    });
                    await database.ref('/verifications').set({
                        placeholder: true
                    });

                    logger.log('Database purged');
                });
                break;

            default:
                console.log(`Unknown command: ${key}`);
                break;
        }
    });
};
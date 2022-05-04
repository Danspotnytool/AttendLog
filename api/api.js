
// Require all dipendencies
const fs = require('fs');
const path = require('path');

// Require all utilities
const logger = require('../util/logger.js');
const global = require('../util/global.js');

// Require all route
const users = require('./routes/users.js');
const classes = require('./routes/classes.js');
const verifications = require('./routes/verifications.js');

module.exports = (app) => {
    // Catch all requests
    app.use('*', (req, res, next) => {
        if (global.loadedAPIs.length !== 4) {
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            logger.log(`${ip} tried to access ${req.originalUrl} but the API is not loaded yet`);
            return res.send({
                message: 'Invalid request - API is not yet loaded',
                code: '400'
            });
        };
        next();
    });

    // Get the router from the app
    app.use('/api/users', users);
    app.use('/api/classes', classes);
    app.use('/api/verifications', verifications);

    app.get('/api/*', (req, res) => {
        res.status(404).send({
            message: 'API route not found',
            code: '404'
        });
    });
};
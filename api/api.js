
// Require all dipendencies
const fs = require('fs');
const path = require('path');

// Require all route
const users = require('./routes/users.js');
const classes = require('./routes/classes.js');
const verifications = require('./routes/verifications.js');

module.exports = (app) => {
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
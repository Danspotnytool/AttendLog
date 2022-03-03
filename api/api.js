
// Require all dipendencies
const fs = require('fs');
const path = require('path');

// Require all route
const users = require('./routes/users.js');

module.exports = (app) => {
    // Get the router from the app
    app.use('/api/users', users);
};
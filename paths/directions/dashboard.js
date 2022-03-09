const path = require('path');

// Require database
const { database } = require('../../util/databaseConnection.js');

module.exports = {
    direction: 'dashboard',
    alias: [],
    execute: (req, res, next) => {
        res.sendFile(path.join(__dirname,'../static/dashboard.html'));
    }
};
const path = require('path');

// Require all utilities
const global = require('../../util/global.js');

module.exports = {
    direction: 'status',
    alias: [],
    execute: (req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);



        res.sendFile(path.join(__dirname,'../static/status.html'));
    }
};
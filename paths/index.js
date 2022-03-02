const path = require('path');

module.exports = {
    ailias: ['home', 'dashboard', 'index', 'default', 'index.html'],
    execute: (req, res, next) => {
        res.sendFile(path.join(__dirname,'./static/index.html'));
    }
};
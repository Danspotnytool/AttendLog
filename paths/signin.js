const path = require('path');

module.exports = {
    alias: ['login'],
    execute: (req, res, next) => {
        res.sendFile(path.join(__dirname,'./static/signin.html'));
    }
};
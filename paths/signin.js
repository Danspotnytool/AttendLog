const path = require('path');

module.exports = {
    ailias: ['login'],
    execute: (req, res, next) => {
        res.sendFile(path.join(__dirname,'./static/signin.html'));
    }
};
const path = require('path');

module.exports = {
    alias: ['signup', 'register'],
    execute: (req, res, next) => {
        res.sendFile(path.join(__dirname,'./static/signup.html'));
    }
};
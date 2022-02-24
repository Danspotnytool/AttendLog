const path = require('path');

module.exports = (req, res, next) => {
    res.send({
        message: 'This is the routes template',
        date: Date.now()
    });
};
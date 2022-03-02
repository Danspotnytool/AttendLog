const path = require('path');

module.exports = (req, res, next) => {
    // res.sendFile(path.join(__dirname,'./static/index.html'));
    // res.send({
    //     message: 'This is the routes template',
    //     samplePath: `res.sendFile(path.join(__dirname,'./static/index.html'));`,
    //     date: Date.now()
    // });
};
module.exports = {
    alias: ['templates', 'sample'],
    execute: (req, res, next) => {
        // res.sendFile(path.join(__dirname,'./static/index.html'));
        res.send({
            message: 'This is the routes template',
            samplePath: `res.sendFile(path.join(__dirname,'./static/index.html'));`,
            date: Date.now()
        });
    }
}
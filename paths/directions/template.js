const path = require('path');

// // Require database
// const { database } = require('../util/databaseConnection.js');

// module.exports = {
//     direction: 'dashboard',
//     alias: [],
//     execute: (req, res, next) => {
//         res.sendFile(path.join(__dirname,'./static/index.html'));
//     }
// };
module.exports = {
    direction: 'template',
    alias: ['templates', 'sample'],
    execute: (req, res, next) => {
        // res.sendFile(path.join(__dirname,'./static/index.html'));
        res.send({
            message: 'This is the routes template',
            samplePath: `res.sendFile(path.join(__dirname,'../static/index.html'));`,
            date: Date.now()
        });
    }
}
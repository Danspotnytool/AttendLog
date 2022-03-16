const path = require('path');



module.exports = {
    direction: 'classes',
    alias: [],
    execute: (req, res, next) => {
        res.sendFile(path.join(__dirname,'../../static/dashboardPanels/classes.html'));
    }
}
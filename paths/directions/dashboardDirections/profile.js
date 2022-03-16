const path = require('path');



module.exports = {
    direction: 'profile',
    alias: [],
    execute: (req, res, next) => {
        res.sendFile(path.join(__dirname,'../../static/dashboardPanels/profile.html'));
    }
}
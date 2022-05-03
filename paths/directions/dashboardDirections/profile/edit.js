const path = require('path');



module.exports = {
    direction: 'edit',
    alias: [],
    execute: (req, res, next) => {
        res.sendFile(path.join(__dirname,'../../../static/dashboardPanels/profile/edit.html'));
    }
}
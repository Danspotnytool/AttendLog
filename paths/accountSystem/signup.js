const path = require('path');

// Require database
const { database } = require('../../util/databaseConnection.js');


module.exports = {
    direction: 'signup',
    alias: ['signup', 'register'],
    execute: (req, res, next) => {
        // Get request cookies
        const cookies = req.headers.cookie;
        let user = {};
        try {
            user = JSON.parse(cookies);
        } catch(err) {
            return res.sendFile(path.join(__dirname, '../static/signup.html'));
        };
        if (user.userID && user.token) {

        } else {
            return res.sendFile(path.join(__dirname, '../static/signup.html'));
        };
        // Check if the user is in the database
        database.ref(`/users/${user.userID}`).once('value').then((snapshot) => {
            if (snapshot.val()) {
                const userFromDB = snapshot.val();
                if (userFromDB.token === user.token) {
                    res.redirect('/');
                } else {
                    res.sendFile(path.join(__dirname, '../static/signup.html'));
                };
            } else {
                res.sendFile(path.join(__dirname, '../static/signup.html'));
            };
        });
    }
};
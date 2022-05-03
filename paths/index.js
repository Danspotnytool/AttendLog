// Require all dipendencies
const express = require('express');
const fs = require('fs');

const path = require('path');

// Require database
const { database } = require('../util/databaseConnection.js');

// Require all Utilites
const logger = require('../util/logger.js');

// Require all directions
// Using fs
// Ignore folders
const direction = fs.readdirSync(path.join(__dirname, './directions')).filter((file) => {
    return file.endsWith('.js');
});
// Require all dashboardDirections
const dashboardDirections = fs.readdirSync(path.join(__dirname, './directions/dashboardDirections'));

// Require all profile directions
const profileDirections = fs.readdirSync(path.join(__dirname, './directions/dashboardDirections/profile'));

// Require accountSystem directions
const accountSystems = fs.readdirSync(path.join(__dirname, './accountSystem'));

// Require all utilites directions
const utilities = fs.readdirSync(path.join(__dirname, './utilities'));

module.exports = (app) => {
    logger.log('Loading all routes');

    // Static files
    app.use(express.static(path.join(__dirname, './static/')));



    // For each direction
    direction.forEach((dir) => {
        // Require the direction
        const directionObj = require(`./directions/${dir}`);

        // get the direction
        const direction = directionObj.direction;
        // get the alias
        const alias = directionObj.alias;

        // Add the direction to the app
        app.get(`/${direction}`, (req, res, next) => {
            // Get the cookies
            const cookies = req.headers.cookie;
            let user = {};
            try {
                user = JSON.parse(cookies);
            } catch(err) {
                return res.sendFile(path.join(__dirname, './static/signup.html'));
            };
            if (user.userID && user.token) {
                database.ref(`/users/${user.userID}`).once('value').then((snapshot) => {
                    if (snapshot.val() === null) {
                        return res.redirect('/signup');
                    };
                    const userFromDB = snapshot.val();
                    if (userFromDB.token === user.token) {
                        directionObj.execute(req, res, next);
                    } else {
                        return res.redirect('/signup');
                    };
                });
            } else {
                return res.redirect(`/signup`);
            };
        });
    });

    dashboardDirections.forEach((dir) => {
        // Require the direction
        const dashboardDirectionObj = require(`./directions/dashboardDirections/${dir}`);
        // Add the direction to the main app
        app.get(`/dashboardPanels/${dashboardDirectionObj.direction}`, (req, res, next) => {
            dashboardDirectionObj.execute(req, res, next);
        });

        // Add the direction to the main panel
        app.get(`/dashboard/${dashboardDirectionObj.direction}`, (req, res, next) => {
            // res.redirect('/dashboard');
            // Get the cookies
            const cookies = req.headers.cookie;
            let user = {};
            try {
                user = JSON.parse(cookies);
            } catch(err) {
                return res.redirect('/signup');
            };
            if (user.userID && user.token) {
                database.ref(`/users/${user.userID}`).once('value').then((snapshot) => {
                    if (snapshot.val() === null) {
                        return res.redirect('/signup');
                    };
                    const userFromDB = snapshot.val();
                    if (userFromDB.token === user.token) {
                        require('./directions/dashboard.js').execute(req, res, next);
                    } else {
                        return res.redirect('/signup');
                    };
                });
            } else {
                return res.redirect(`/signup`);
            };
        });
    });

    // '/dashboard/profile/edit'
    app.get('/dashboard/profile/edit', (req, res, next) => {
        res.redirect('/dashboard/profile');
    });

    profileDirections.forEach((dir) => {
        // Require the direction
        const profileDirectionObj = require(`./directions/dashboardDirections/profile/${dir}`);
        // Add the direction to the main app
        app.get(`/dashboardPanels/profile/${profileDirectionObj.direction}`, (req, res, next) => {
            profileDirectionObj.execute(req, res, next);
        });
    });



    accountSystems.forEach((dir) => {
        // Require the direction
        const accountSystemObj = require(`./accountSystem/${dir}`);

        // get the direction
        const direction = accountSystemObj.direction;

        // get the alias
        const alias = accountSystemObj.alias;

        // Add the direction to the app
        app.get(`/${direction}`, (req, res, next) => {
            accountSystemObj.execute(req, res, next);
        });
    });



    utilities.forEach((dir) => {
        // Require the direction
        const utilitesObj = require(`./utilities/${dir}`);
        app.get(`/${utilitesObj.direction}`, (req, res, next) => {
            utilitesObj.execute(req, res, next);
        });
    });



    app.get('/', (req, res, next) => {
        res.redirect('/dashboard');
    });
};
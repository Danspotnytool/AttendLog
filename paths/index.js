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
const direction = fs.readdirSync(path.join(__dirname, './directions'));

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
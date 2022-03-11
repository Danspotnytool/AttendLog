
// Require all dipendencies
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');


// Require firebase utility
const { database } = require('../../util/databaseConnection.js');



router.use(bodyParser.json());



// Get all classes and classnames from the database
const classes = [];
const getClasses = async () => {
    await database.ref('/classes').once('value', (snapshot) => {
        const classesArray = Object.values(snapshot.val());
        classesArray.forEach((classs) => {
            classes.push(classs);
        });
    });
};
getClasses();


// Create a new class

module.exports = router;
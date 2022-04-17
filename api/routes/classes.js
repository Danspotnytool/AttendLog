
// Require all dipendencies
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const socketClient = require('socket.io-client');


// Require firebase utility
const { database } = require('../../util/databaseConnection.js');

// Require all utilities
const logger = require('../../util/logger.js');
const global = require('../../util/global.js');

// Port
const port = process.env.PORT || 8080;


router.use(bodyParser.json());



// Connect to socket.io client
const io = socketClient(`http://localhost:${port}/apiCalls`);
io.on('connect', () => {
    logger.log('Classes socket connected');
});
// Send a message
const sendMessage = (message) => {
    io.emit(`${process.env.APP_API_KEY}`, message);
};



// Test if connection to database is possible
database.ref('/').once('value').then(() => {
    logger.log('Classes database connected');
}).catch((error) => {
    logger.log(error);
});



// Create a new class
router.post('/create', async (req, res) => {
    sendMessage(JSON.stringify({
        type: 'createClass',
    }));

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const { className, classColor, classDescription } = req.body;
    // Validate the token on the header cookie
    const user = {
        userID: '',
        token: ''
    };
    try {
        user.userID = JSON.parse(req.headers.cookie).userID;
        user.token = JSON.parse(req.headers.cookie).token;
    } catch (err) {
        logger.log(`${ip} - ${user.userID} - Create class Attempt - Invalid Authorization`);
        return res.send({
            message: 'Invalid Authorization',
            code: '400'
        });
    };
    // Validate the token on the database
    const userRef = database.ref(`/users/${user.userID}`);
    await userRef.once('value', (snapshot) => {
        if (!snapshot.val()) {
            logger.log(`${ip} - Create Class Attempt - Invalid User`);
            return res.send({
                message: 'Invalid User',
                code: '400'
            });
        };
        if (snapshot.val().token !== user.token) {
            logger.log(`${ip} - ${user.userID} - Create class Attempt - Invalid Authorization`);
            return res.send({
                message: 'Invalid Authorization',
                code: '400'
            });
        };
    });

    // Create the class
    const classs = {
        classID: `${Math.floor(Math.random() * Math.floor(Math.random() * Date.now()))}`,
        className: className,
        classColor: classColor,
        classDescription: classDescription,
        createdAt: Date.now(),
        classTeacher: user.userID,
        classToken: uuidv4()
    };

    // Add the class to the database
    database.ref(`/classes/${classs.classID}`).set(classs);

    // Add the class to the user's classes array
    // Get the contents of the user's classes array
    const userClasses = [];
    await database.ref(`/users/${user.userID}/classes`).once('value', (snapshot) => {
        // Check if the user has any classes
        if (snapshot.val()) {
            const userClassesArray = Object.values(snapshot.val());
            userClassesArray.forEach((userClass) => {
                userClasses.push(userClass);
            });
        };
    });
    // Add the class to the user's classes array
    userClasses.push(classs.classID);
    // Update the user's classes array
    await database.ref(`/users/${user.userID}/classes`).set(userClasses);

    logger.log(`${ip} - ${user.userID} - Create class - ${classs.classID}`);
    // Send the response
    return res.send({
        message: 'Class created',
        code: '200',
        class: classs
    });
});

// Getting user's classes
router.get('/get', async (req, res) => {
    sendMessage(JSON.stringify({
        type: 'getClasses'
    }));

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Validate the token on the header cookie
    const user = {
        userID: '',
        token: ''
    };
    try {
        user.userID = JSON.parse(req.headers.cookie).userID;
        user.token = JSON.parse(req.headers.cookie).token;
    } catch (err) {
        logger.log(`${ip} - ${username} - Get Class Attempt - Invalid Authorization`);
        return res.send({
            message: 'Invalid Authorization',
            code: '400'
        });
    };
    // Validate the token on the database
    const userRef = database.ref(`/users/${user.userID}`);
    await userRef.once('value', (snapshot) => {
        if (!snapshot.val()) {
            logger.log(`${ip} - Get Class Attempt - Invalid User`);
            return res.send({
                message: 'Invalid User',
                code: '400'
            });
        };
        if (snapshot.val().token !== user.token) {
            logger.log(`${ip} - ${username} - Get Class Attempt - Invalid Authorization`);
            return res.send({
                message: 'Invalid Authorization',
                code: '400'
            });
        };
        // Assign the user's classes to the response
        user['classes'] = snapshot.val().classes;
    });

    // Get the user's classes
    const userClasses = [];
    await database.ref(`/users/${user.userID}/classes`).once('value', (snapshot) => {
        // Check if the user has any classes
        if (snapshot.val()) {
            const userClassesArray = Object.values(snapshot.val());
            userClassesArray.forEach((userClass) => {
                userClasses.push(userClass);
            });
        };
        // But if the user has no classes, return an empty array
        if (userClasses.length === 0) {
            userClasses.push('');
        };
    });

    // Check if the user has any classes
    if (userClasses.length <= 0 || userClasses[0] === '') {
        logger.log(`${ip} - ${user.userID} - Get Class Attempt - No Classes`);
        return res.send({
            message: 'No Classes',
            code: '400'
        });
    };

    // Get the classes
    var classes = [];
    // Get the contents of the user's classes array as a promise
    const userClassesPromise = new Promise((resolve, reject) => {
        userClasses.forEach((userClass) => {
            database.ref(`/classes/${userClass}`).once('value', async (snapshot) => {
                const thisClass = snapshot.val();
                // Get the teacher's name
                await database.ref(`/users/${thisClass.classTeacher}`).once('value', (snapshot) => {
                    thisClass['teacherName'] = snapshot.val().username;
                });
                // Get the number of students in the class
                await database.ref(`/classes/${userClass}/students`).once('value', (snapshot) => {
                    // Check if the class has any students
                    if (snapshot.val()) {
                        thisClass['numberOfStudents'] = snapshot.val().length;
                    } else {
                        thisClass['numberOfStudents'] = 0;
                    };
                });
                classes.push(thisClass);
                if (classes.length === userClasses.length) {
                    resolve(classes);
                };
            });
        });
    });
    
    // Map the response to remove the token and teacher's id
    const classesPromise = await userClassesPromise.then((classes) => {
        return classes.map((classs) => {
            return {
                classColor: classs.classColor,
                classDescription: classs.classDescription,
                classID: classs.classID,
                className: classs.className,
                teacherName: classs.teacherName,
                createdAt: classs.createdAt,
                numberOfStudents: classs.numberOfStudents
            };
        });
    });

    logger.log(`${ip} - ${user.userID} - Get Class Success`);
    // Send the response
    return res.send(classesPromise);
});



// Join a class
router.post('/join', async (req, res) => {    
    sendMessage(JSON.stringify({
        type: 'joinClass',
    }));

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Validate the token on the header cookie
    const user = {
        userID: '',
        token: '',
        classes: []
    };
    try {
        user.userID = JSON.parse(req.headers.cookie).userID;
        user.token = JSON.parse(req.headers.cookie).token;
    } catch (err) {
        logger.log(`${ip} - ${username} - Join Class Attempt - Invalid Authorization`);
        return res.send({
            message: 'Invalid Authorization',
            code: '400'
        });
    };
    // Validate the token on the database
    const userRef = database.ref(`/users/${user.userID}`);
    await userRef.once('value', (snapshot) => {
        if (!snapshot.val()) {
            logger.log(`${ip} - Join Class Attempt - Invalid User`);
            return res.send({
                message: 'Invalid User',
                code: '400'
            });
        };
        if (snapshot.val().token !== user.token) {
            logger.log(`${ip} - ${username} - Join Class Attempt - Invalid Authorization`);
            return res.send({
                message: 'Invalid Authorization',
                code: '400'
            });
        };
        // Assign the user's classes to the response
        if (snapshot.val().classes) {
            user.classes = snapshot.val().classes;
        };
    });

    // Get the request body
    const { classID, classToken } = req.body;

    // Check if the feilds are empty
    if (!classID || !classToken) {
        logger.log(`${ip} - ${user.userID} - Join Class Attempt - Empty Fields`);
        return res.send({
            message: 'Empty Fields',
            code: '400'
        });
    };

    // Check if the class exists
    const classRef = database.ref(`/classes/${classID}`);
    await classRef.once('value', async (snapshot) => {
        if (!snapshot.val()) {
            logger.log(`${ip} - ${user.userID} - Join Class Attempt - Class Not Found`);
            return res.send({
                message: 'Class Not Found',
                code: '400'
            });
        };
        // Check if the token is valid
        if (classToken != snapshot.val().classToken) {
            logger.log(`${ip} - ${user.userID} - Join Class Attempt - Invalid Token`);
            return res.send({
                message: 'Invalid Token',
                code: '400'
            });
        };

        // Check if the user is already in the class
        if (user.classes.includes(classID)) {
            logger.log(`${ip} - ${user.userID} - Join Class Attempt - Already in Class`);
            return res.send({
                message: 'Already in Class',
                code: '400'
            });
        };

        // Add the user to the class
        // Check if the class has any students
        if (snapshot.val().students) {
            // Get the students array length
            const studentsLength = Object.keys(snapshot.val().students).length;
            // Add the user to the students array
            await database.ref(`/classes/${classID}/students/${studentsLength}`).set(user.userID);
        } else {
            // Add the user to the students array
            await database.ref(`/classes/${classID}/students/0`).set(user.userID);
        };
        // Add the class to the user's classes array
        user.classes.push(classID);
        // Update the user's classes array
        // Check if the user has any classes
        if (user.classes.length > 0) {
            // Update the user's classes array
            await database.ref(`/users/${user.userID}/classes/0`).set(classID);
        } else {
            // Update the user's classes array
            // Get the classes array length
            const classesLength = Object.keys(user.classes).length;
            await database.ref(`/users/${user.userID}/classes/${classesLength}`).set(classID);
        };
        // Send the response
        logger.log(`${ip} - ${user.userID} - Join Class Success`);
        return res.send({
            message: 'Join Class Success',
            code: '200'
        });
    });
});

module.exports = router;
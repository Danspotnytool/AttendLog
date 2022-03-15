
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



// Get all classes and classnames from the database
const classes = [];
const getClasses = async () => {
    await database.ref('/classes').once('value', (snapshot) => {
        const classesArray = Object.values(snapshot.val());
        classesArray.forEach((classs) => {
            classes.push(classs);
        });
        logger.log('Classes database loaded');
        global.classesDBIsLoaded = true;
    });
    // Listen to changes in the database
    // Child added
    database.ref('/classes').on('child_added', (snapshot) => {
        // Check if this class is already in the array
        // The structure of the array is:
        // [
        //     {
        //         id: '',
        //         className: '',
        //         createdAt: '',
        //     }
        // ]
        const classs = snapshot.val();
        const classExists = classes.find(classFromArray => classFromArray.classID === classs.classID);;
        if (!classExists) {
            classes.push(classs);
        };
    });
    // Child removed
    database.ref('/classes').on('child_removed', (snapshot) => {
        const classs = snapshot.val();
        const classIndex = classes.findIndex(classFromArray => classFromArray.classID === classs.classID);
        if (classIndex > -1) {
            classes.splice(classIndex, 1);
        };
    });
};
getClasses();



// Create a new class
router.post('/create', async (req, res) => {    
    sendMessage(JSON.stringify({
        type: 'createClass',
    }));

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
        logger.log(err);
        return res.send({
            message: 'Invalid Authorization',
            code: '400'
        });
    };
    // Validate the token on the database
    const userRef = database.ref(`/users/${user.userID}`);
    await userRef.once('value', (snapshot) => {
        if (snapshot.val().token !== user.token) {
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
    // Check if the user has any classes
    if (user.classes) {
        user.classes.forEach((userClass) => {
            // Get the class from the database
            database.ref(`/classes/${userClass}`).once('value', (snapshot) => {
                userClasses.push(snapshot.val());
            });
        });
        // Get the name of the teacher and number of students for each class
        const userClassesWithTeacher = [];
        for (const classs of userClasses) {
            let teacherName = '';
            let numberOfStudents = 0;
            await database.ref(`/users/${classs.classTeacher}`).once('value', (snapshot) => {
                teacherName = snapshot.val().username;
            });
            await database.ref(`/classes/${classs.classID}/students`).once('value', (snapshot) => {
                // Check if the class has any students
                if (snapshot.val()) {
                    const studentsArray = Object.values(snapshot.val());
                    numberOfStudents = studentsArray.length;
                };
            });
            classs['teacherName'] = teacherName;
            classs['numberOfStudents'] = numberOfStudents;
            userClassesWithTeacher.push(classs);
        };
        // Map the userClassesWithTeacher and remove the classToken
        const userClassesWithTeacherMapped = userClassesWithTeacher.map(classs => {
            delete classs.classToken;
            return classs;
        });
        // Send the response
        return res.send(userClassesWithTeacherMapped); 
    };
    logger.log(`${ip} - ${username} - Get Class Attempt - No Classes Found`);
    res.send({
        message: 'No classes found',
        code: '404'
    });
});



// Join a class
router.post('/join', async (req, res) => {    
    sendMessage(JSON.stringify({
        type: 'joinClass',
    }));

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

    // Validate the classID and classToken
    database.ref(`/classes/${classID}`).once('value', async (snapshot) => {
        // Check if the class exist
        if (!snapshot.val()) {
            logger.log(`${ip} - ${username} - Join Class Attempt - Class Not Found`);
            return res.send({
                message: 'Class not found',
                code: '404'
            });
        };
        // Check if the classToken is valid
        if (snapshot.val().classToken !== classToken) {
            logger.log(`${ip} - ${username} - Join Class Attempt - Invalid Class Token`);
            return res.send({
                message: 'Invalid classToken',
                code: '400'
            });
        };
        if (user.classes.includes(classID)) {
            logger.log(`${ip} - ${username} - Join Class Attempt - Already Joined Class`);
            return res.send({
                message: 'User already in the class',
                code: '400'
            });
        };
        // Add the user to the class
        // The class's students array
        const students = [];
        // Get the class's students array
        await database.ref(`/classes/${classID}/students`).once('value', (snapshot) => {
            // Check if the class has any students
            if (snapshot.val()) {
                const studentsArray = Object.values(snapshot.val());
                studentsArray.forEach((student) => {
                    students.push(student);
                });
            };
        });
        // Add the user to the class's students array
        students.push(user.userID);
        // Update the class's students array
        await database.ref(`/classes/${classID}/students`).set(students);

        // Add the class to the user's classes array
        user['classes'].push(classID);
        // Update the user's classes array
        await database.ref(`/users/${user.userID}/classes`).set(user['classes']);

        // Send the response
        return res.send({
            message: 'User added to class',
            code: '200'
        });
    });
});

module.exports = router;
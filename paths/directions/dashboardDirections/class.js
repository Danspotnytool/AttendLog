const path = require('path');

// Require database connection
const { database } = require('../../../util/databaseConnection.js');

// Require all Utilites
const logger = require('../../../util/logger.js');

module.exports = {
    direction: 'class',
    alias: [],
    execute: async (req, res, next) => {
        // Get the classID from url
        const classID = req.params.classID;

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
            logger.log(`${ip} - ${username} - Get Class Page Attempt - Invalid Authorization`);
            return res.send({
                message: 'Invalid Authorization',
                code: '400'
            });
        };

        // Validate the token on the database
        const userRef = database.ref(`/users/${user.userID}`);
        await userRef.once('value', (snapshot) => {
            if (!snapshot.val()) {
                logger.log(`${ip} - Get Class Page Attempt - Invalid User`);
                return res.send({
                    message: 'Invalid User',
                    code: '400'
                });
            } else if (snapshot.val().token !== user.token) {
                logger.log(`${ip} - ${user.userID} - Get Class Page Attempt - Invalid Authorization`);
                return res.send({
                    message: 'Invalid Authorization',
                    code: '400'
                });
            };

            // Check if the class exists
            const classRef = database.ref(`/classes/${classID}`);
            classRef.once('value', (snapshot) => {
                const classVal = snapshot.val();
                if (!snapshot.val()) {
                    logger.log(`${ip} - ${user.userID} - Get Class Page Attempt - Invalid Class`);
                    return res.send({
                        message: 'Invalid Class',
                        code: '400'
                    });
                };

                // Check if the user is in the class
                const userClassesRef = database.ref(`/users/${user.userID}/classes/`);
                userClassesRef.once('value', (snapshot) => {
                    if (!snapshot.val()) {
                        logger.log(`${ip} - ${user.userID} - Get Class Page Attempt - User Not In Class`);
                        return res.send({
                            message: 'Not In Class',
                            code: '400'
                        });
                    };
                    const userClasses = snapshot.val();
                    if (!userClasses.includes(classID)) {
                        logger.log(`${ip} - ${user.userID} - Get Class Page Attempt - User Not In Class`);
                        return res.send({
                            message: 'Not In Class',
                            code: '400'
                        });
                    };

                    // Check if the user is the class teacher
                    if (user.userID === classVal.classTeacher) {
                        res.sendFile(path.join(__dirname,'../../static/dashboardPanels/class/teacher.html'));
                    } else {
                        res.sendFile(path.join(__dirname,'../../static/dashboardPanels/class/student.html'));
                    };
                });
            });
        });
    }
}
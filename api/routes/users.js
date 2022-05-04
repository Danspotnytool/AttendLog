
// Require all dipendencies
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const expressFileUpload = require('express-fileupload');
const bycrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const socketClient = require('socket.io-client');
const fs = require('fs');
const path = require('path');




// Require firebase utility
const { database } = require('../../util/databaseConnection.js');

// Require gmail utility
const { sendMail } = require('../../util/gmailAPI.js');

// Require all utilities
const logger = require('../../util/logger.js');
const global = require('../../util/global.js');

// Port
const port = process.env.PORT || 8080;


// Require verification.txt
const verificationText = fs.readFileSync(path.join(__dirname, '../../emailTemplates/verification.txt'), 'utf8');


router.use(bodyParser.json());
router.use(expressFileUpload());


// Use discord as database for images
const Discord = require('discord.js');
const client = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_BANS,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    ]
});

client.on('ready', () => {
    global.loadedAPIs.push('discord');
    logger.log('Discord API is ready');
});

const uploadImage = async (imageBuffer, userID) => {
    try {
        // Create an image from the image buffer
        // const { MessageAttachment } = require('discord.js')

        // const buffer = Buffer.from('Text in file')
        // const attachment = new MessageAttachment(buffer, 'file.txt')
        // channel.send(attachment)
        imageBuffer = Buffer.from(imageBuffer);
        const attachment = new Discord.MessageAttachment(imageBuffer, 'image.text');

        const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
        const message = await channel.send({content: `${userID}`, files: [
            { attachment: imageBuffer }
        ]});

        // Get the url of the image attachment
        const url = message.attachments.first().url;

        return url;
    } catch(err) {
        console.log(err);
        return err;
    };
};

client.login(process.env.DISCORD_TOKEN);


// Connect to socket.io client
const io = socketClient(`http://localhost:${port}/apiCalls`);
io.on('connect', () => {
    logger.log('Users socket connected');
});
// Send a message
const sendMessage = (message) => {
    io.emit(`${process.env.APP_API_KEY}`, message);
};



// Test if connection to database is possible
database.ref('/').once('value').then(() => {
    global.loadedAPIs.push('users');
    logger.log('Users database connected');
}).catch((error) => {
    logger.log(error);
});



// Signup route
router.post('/signup',  async (req, res, next) => {
    sendMessage(JSON.stringify({
        type: 'signup',
    }));

    // Get the data from the request
    // Username, First name, Last name, Email address, and Password
    let { username, firstName, lastName, email, password } = req.body;
    res.statusCode = 200;
    // Get the IP address of the user
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Check if all the fields are filled
    if (!username || !firstName || !lastName || !email || !password) {
        logger.log(`${ip} - ${username} - Signup Attempt - Missing fields`);
        return res.send({
            message: 'Please fill in all the fields',
            code: '400'
        });
    };
    // Check character lengths of the fields
    if (username.length > 20 || firstName.length > 20 || lastName.length > 20 || email.length > 50 || password.length > 20) {
        logger.log(`${ip} - ${username} - Signup Attempt - Character length exceeded`);
        return res.send({
            message: 'Please make sure all the fields are less than 20 characters',
            code: '400'
        });
    };

    if (username.length < 6 || firstName.length < 3 || lastName.length < 4 || email.length < 6 || password.length < 6) {
        logger.log(`${ip} - ${username} - Signup Attempt - Character length is too short`);
        return res.send({
            message: `Please make sure all the fields have the proper length
(Username: 6-20 characters
First Name: 3-20 characters
Last Name: 4-20 characters
Email: 6-50 characters
Password: 6-20 characters)`,
            code: '400'
        });
    };
    // Check if the email is valid
    if (!/^[^@]+@[^@.]+\.[a-z]+$/i.test(email)) {
        logger.log(`${ip} - ${username} - Signup Attempt - Invalid email`);
        return res.send({
            message: 'Please make sure the email is valid',
            code: '400'
        });
    };
    // Check if the password is valid
    // It should be at least 8 characters long
    // It should contain at least one number
    // It should contain at least one uppercase letter
    // It should contain at least one lowercase letter
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})/.test(password)) {
        logger.log(`${ip} - ${username} - Signup Attempt - Invalid password`);
        return res.send({
            message: 'The password should be at least 6 characters long and contain at least one number, one uppercase letter and one lowercase letter',
            code: '400'
        });
    };

    // Check if the username is already taken
    const userExists = await database.ref(`/usernames/${username}`).once('value');
    if (userExists.val()) {
        logger.log(`${ip} - ${username} - Signup Attempt - Username already taken`);
        return res.send({
            message: 'The username is already taken',
            code: '400'
        });
    };

    // Usernames can't have special characters, spaces, or start with a number
    if (/[^a-zA-Z0-9]/.test(username)) {
        logger.log(`${ip} - ${username} - Signup Attempt - Invalid username (special characters)`);
        return res.send({
            message: 'The username can only contain letters and numbers',
            code: '400'
        });
    };
    if (/^[0-9]/.test(username)) {
        logger.log(`${ip} - ${username} - Signup Attempt - Invalid username (starts with a number)`);
        return res.send({
            message: `The username can't start with a number`,
            code: '400'
        });
    };
    if (/\s/.test(username)) {
        logger.log(`${ip} - ${username} - Signup Attempt - Invalid username (contains a space)`);
        return res.send({
            message: `The username can't contain spaces`,
            code: '400'
        });
    };


    // Check if the email is already taken
    database.ref(`/emails/${encodeURIComponent(email).replace('.', '%2E')}`).once('value', async (snapshot) => {
        if (snapshot.val()) {
            logger.log(`${ip} - ${username} - Signup Attempt - Email already taken`);
            return res.send({
                message: 'The email is already taken',
                code: '400'
            });
        };



        try {
            const hashedPassword = await bycrypt.hash(password, 10);
            password = hashedPassword;
        } catch(err) {
            logger.log(err);
            return res.send({
                message: 'Something went wrong',
                code: '400'
            });
        };


        // Generate userID
        const userID = `${Math.floor(Math.random() * Math.floor(Math.random() * Date.now()))}`;


        // Generate verification link
        let verificationString = 'hi';
        for (let i = 0; i < 20; i++) {
            verificationString += Math.random().toString(36).substring(2, 3);
            verificationString += Math.random().toString(36).substring(2, 3);
            verificationString += Math.random().toString(36).substring(2, 3);
        };
        // If the request is from localhost, then the verification link will be localhost/verify/:verificationString
        // If the request is from the server, then the verification link will be https://www.attendlog.ga/verify/:verificationString
        const verificationLink = `${req.protocol}://${req.get('host')}/api/verifications/verify/${verificationString}`;
        // Verification message
        const verificationMessageText = verificationText.replace('{verification_link}', `${verificationLink}`).replace('{username}', username);
        const verificationMessageHTML = verificationText.replace('{verification_link}', `<a href="${verificationLink}">${verificationLink}</a>`)
            .replace('{username}', username)
            .replace(/\n/g, '<br>');
        // Send the verification link to the user's email
        const sendMailResult = await sendMail(`${email}`, 'Verify your account', {
            text: `${verificationMessageText}`,
            html: `${verificationMessageHTML}`
        });

        // Check if the email was sent successfully
        if (sendMailResult.statusCode !== 200) {
            logger.log(`${ip} - ${username} - Signup Attempt - Failed to send email`);
            return res.send({
                message: 'Failed to send email',
                code: '400'
            });
        };
        // Write the verification link to the database
        database.ref(`/verifications/${verificationString}`).set({
            'userID': userID,
            'createdAt': Date.now()
        });



        const user = {
            username: username,
            userID: userID,
            email: email,
            token: uuidv4(),
            profile: {
                username: username,
                profilePictureLink: null,
                name: {
                    firstName: firstName,
                    lastName: lastName,
                    middleName: null,
                },
                referenceID: null,
                email: email,
                birthday: null
            },
            verified: false,
            verificationString: verificationString,
            password: password,
            dateCreated: Date.now(),
            ipCreated: ip
        };

        // Write to the database
        try {
            await database.ref(`/users/${user.userID}`).set(user);

            // Write the username and email to the database
            await database.ref(`/usernames/${user.username}`).set(user.userID);
            await database.ref(`/emails/${encodeURIComponent(user.email).replace('.', '%2E')}`).set(user.userID);

            // Return the user
            logger.log(`${ip} - ${username} - Signup Success`);
            res.send({
                message: 'Account created',
                user: {
                    userID: user.userID,
                    token: user.token
                },
                code: '200'
            });
        } catch(err) {
            logger.log(err);
            return res.send({
                message: 'Something went wrong',
                code: '400'
            });
        };
    });
});

// Signin route
router.post('/signin', async (req, res, next) => {
    sendMessage(JSON.stringify({
        type: 'signin',
    }));

    // Get the data from the request
    // Username and Password
    const { username, password } = req.body;
    // Get the IP address of the user
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Check if username and password is defined
    if (!username || !password) {
        logger.log(`${ip} - ${username} - Signin Attempt - Missing fields`);
        return res.send({
            message: 'Please fill in all the fields',
            code: '400'
        });
    };



    // Check if the username exists
    database.ref(`/usernames/${username}`).once('value', (snapshot) => {
        if (!snapshot.val()) {
            logger.log(`${ip} - ${username} - Signin Attempt - Invalid username`);
            return res.send({
                message: 'Invalid username or password',
                code: '400'
            });
        };

        const userID = snapshot.val();

        // Get the user from the database
        database.ref(`/users/${userID}`).once('value', (snapshot) => {
            const user = snapshot.val();

            // Check if the password is correct
            try {
                if (!bycrypt.compareSync(password, user.password)) {
                    logger.log(`${ip} - ${username} - Signin Attempt - Invalid password`);
                    return res.send({
                        message: 'Invalid username or password',
                        code: '400'
                    });
                };
            } catch (err) {
                logger.log(err);
                return res.send({
                    message: 'Something went wrong',
                    code: '400'
                });
            };

            // Return the user
            logger.log(`${ip} - ${username} - Signin Success`);
            res.send({
                message: 'Success',
                user: {
                    userID: user.userID,
                    token: user.token
                },
                code: '200'
            });
        });
    });
});

// Getting someones profile
router.get('/profile/:userID', async (req, res, next) => {
    sendMessage(JSON.stringify({
        type: 'profile',
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
        logger.log(`${ip} - Get Profile Attempt - Invalid Authorization`);
        return res.send({
            message: 'Invalid Authorization',
            code: '400'
        });
    };
    // Validate the token on the database
    const userRef = database.ref(`/users/${user.userID}`);
    await userRef.once('value', (snapshot) => {
        if (!snapshot.val()) {
            logger.log(`${ip} - Get Profile Attempt - Invalid User`);
            return res.send({
                message: 'Invalid User',
                code: '400'
            });
        };
        if (snapshot.val().token !== user.token) {
            logger.log(`${ip} - Get Profile Attempt - Invalid Authorization`);
            return res.send({
                message: 'Invalid Authorization',
                code: '400'
            });
        };
        // Assign the user's classes to the response
        if (snapshot.val().classes) {
            user.classes = snapshot.val().classes;
        };

        // Get the user from the database
        const userID = req.params.userID;
        database.ref(`/users/${userID}/profile`).once('value', (snapshot) => {
            const user = snapshot.val();
    
            if (!user) {
                logger.log(`${ip} - Get Profile Attempt - Invalid userID`);
                return res.send({
                    message: 'Invalid userID',
                    code: '400'
                });
            };
    
            // Return the user
            logger.log(`${ip} - Get Profile Success`);
            res.send({
                message: 'Success',
                user: {
                    userID: userID,
                    username: user.username,
                    name: {
                        firstName: user.name.firstName,
                        middleName: user.name.middleName,
                        lastName: user.name.lastName
                    },
                    prefix: user.prefix || '',
                    suffix: user.suffix || '',
                    email: user.email,
                    userID: user.userID,
                    referenceID: user.referenceID || 'N/A',
                    profilePicture: user.profilePicture || '',
                },
                code: '200'
            });
        });
    });
});

// Editing Profile
router.post('/profile/:userID/edit', async (req, res, next) => {
    sendMessage(JSON.stringify({
        type: 'editProfile',
    }));

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Get file from the request
    let file = null;
    try {
        file = req.files['profilePicture'];
    } catch (err) {

    };

    // Get All the data from the request
    const { username, firstName, middleName, lastName, prefix, suffix, birthday, course, referenceID } = req.body;

    // Check if all of those data are empty
    if (file || username || firstName || middleName || lastName || prefix || suffix || birthday || course || referenceID) {

    } else {
        logger.log(`${ip} - Edit Profile Attempt - Missing fields`);
        return res.send({
            message: 'Please fill in any of the fields',
            code: '400'
        });
    };

    // Validate the token on the header cookie
    const user = {
        userID: '',
        token: ''
    };
    try {
        user.userID = JSON.parse(req.headers.cookie).userID;
        user.token = JSON.parse(req.headers.cookie).token;
    } catch (err) {
        logger.log(`${ip} - Get Edit Profile Attempt - Invalid Authorization`);
        return res.send({
            message: 'Invalid Authorization',
            code: '400'
        });
    };
    // Validate the token on the database
    const userRef = database.ref(`/users/${user.userID}`);
    await userRef.once('value', (snapshot) => {
        if (!snapshot.val()) {
            logger.log(`${ip} - Get Edit Profile Attempt - Invalid User`);
            return res.send({
                message: 'Invalid User',
                code: '400'
            });
        };
        if (snapshot.val().token !== user.token) {
            logger.log(`${ip} - Get Edit Profile Attempt - Invalid Authorization`);
            return res.send({
                message: 'Invalid Authorization',
                code: '400'
            });
        };
        // Assign all snapshot data to the user object
        Object.keys(snapshot.val()).forEach(key => {
            user[key] = snapshot.val()[key];
        });

        if (file) {
            // Check if file is an image
            if (file.mimetype.split('/')[0] !== 'image') {
                return res.send({
                    message: 'File is not an image',
                    code: '400'
                });
            };

            // Check if file is too large
            //  7mb is the max size
            if (file.size > 7000000) {
                return res.send({
                    message: 'File is too large',
                    code: '400'
                });
            };

            // Upload the file to the storage
            uploadImage(file.data, user.userID).then((url) => {
                logger.log(`${ip} - Edit Profile Success`);
                // Update the user's profile picture
                database.ref(`/users/${user.userID}/profile/profilePicture`).set(url);
            }).catch((err) => {
                console.log(err);
            });
        };

        // Update the user's profile
        const updatedUser = {
            username: username || user.username,
            name: {
                firstName: firstName || user.profile.name.firstName || '',
                middleName: middleName || user.profile.name.middleName || '',
                lastName: lastName || user.profile.name.lastName || '',
            },
            prefix: prefix || user.profile.prefix || '',
            suffix: suffix || user.profile.suffix || '',
            birthday: birthday || user.profile.birthday || '',
            course: course || user.profile.course || '',
            referenceID: referenceID || user.profile.referenceID || ''
        };

        // Update the user's profile
        // Only update the fields that are not empty
        database.ref(`/users/${user.userID}/profile`).update(updatedUser);
        logger.log(`${ip} - Edit Profile Success`);
        res.send({
            message: 'Success',
            code: '200'
        });
    });
});

module.exports = router;
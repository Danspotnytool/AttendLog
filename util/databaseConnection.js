// Environment variables:
require('dotenv').config();

// initialize firebase
const admin = require('firebase-admin');
const serviceAccount = require('../sdk/admin.js');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    apiKey: `${process.env.FIREBASE_API_KEY}`,
    authDomain: "attendlog-c56db.firebaseapp.com",
    databaseURL: `${process.env.FIREBASE_DATABASE_URL}`,
    projectId: "attendlog-c56db",
    storageBucket: "attendlog-c56db.appspot.com"
});

// Initialize the database
const database = admin.database();

module.exports = {
    database: database,
    admin: admin,
};
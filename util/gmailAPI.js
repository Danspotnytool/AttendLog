// Environment variables:
require('dotenv').config();


const nodemailer = require('nodemailer');
const { google } = require('googleapis');


const clientID = `${process.env.GMAIL_CLIENT_ID}`;
const clientSecret = `${process.env.GMAIL_CLIENT_SECRET}`;
const redirectURI = `${process.env.GMAIL_REDIRECT_URI}`;
const refreshToken = `${process.env.GMAIL_REFRESH_TOKEN}`;


const oAuth2Client = new google.auth.OAuth2(
    clientID,
    clientSecret,
    redirectURI
);
oAuth2Client.setCredentials({
    refresh_token: refreshToken
});



/**
 * 
 * @param {string} to Reviever's email address
 * @param {string} subject Subject of the email
 * @param {obj} body Body of the email
 * @param {string} body.text Body of the email in plain text
 * @param {string} body.html Body of the email in HTML
 * @param {string} from Sender's email address (Optional)
 * @returns {Promise}
 */
const sendMail = async (to, subject, {text, html}, from) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: `${process.env.GMAIL_USER}`,
                clientId: clientID,
                clientSecret: clientSecret,
                refreshToken: refreshToken,
                accessToken: accessToken
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `${from || `AttendLog <${process.env.GMAIL_USER}>`}`,
            to: `${to}`,
            subject: `${subject}`,
            text: `${text}`,
            html: `${html}`
        };

        const result = await transport.sendMail(mailOptions);
        return result;
    } catch(err) {
        return err;
    };
};

module.exports = {
    sendMail
};
// Petfinder Auto-response bot

/* 

MIT License

Copyright (c) 2020 Johnny Richardson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 

*/

const {
    google
} = require('googleapis');
const express = require('express');
const base64 = require('js-base64').Base64;
const _ = require('lodash');
const OAuth2Data = require('./credentials.json');

// Create apollo config/graph schema
const apollo = require('./apollo');

// Connect db
require('./db');

// Dog model
const Dog = require('./models/Dog');

const app = express();

const CLIENT_ID = OAuth2Data.client.id;
const CLIENT_SECRET = OAuth2Data.client.secret;
const REDIRECT_URL = OAuth2Data.client.redirect;

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
);
let authed = false;

// Mount apollo middleware (/graphql)
app.use(apollo.getMiddleware());

app.get('/', async (req, res) => {

    const newDog = new Dog({
        name: 'Brielle',
        dateAdded: Date.now()
    });
    newDog.save();

    if (!authed) {
        // Generate an OAuth URL and redirect there
        const url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/gmail.readonly',
        });
        res.redirect(url);
    } else {
        // Get all user emails
        const gmail = google.gmail({
            version: 'v1',
            auth: oAuth2Client,
        });

        try {
            // List of msg ids
            const res = await gmail.users.messages.list({
                userId: 'me',
            });
            const msgs = res.data.messages;

            if (msgs.length) {
                // For each message, obtain full data
                msgs.forEach(async (msg) => {
                    const messageRes = await gmail.users.messages.get({
                        id: msg.id,
                        userId: 'me',
                    });

                    // If message has the subject we're looking for...
                    const subject = 'Petfinder Adoption Inquiry';
                    const isInquiry =
                        _.find(messageRes.data.payload.headers, {
                            name: 'Subject',
                        }).value === subject;

                    if (isInquiry) {
                        // ...decode raw body
                        const bodyBase64 = messageRes.data.payload.parts[0].parts[0].body.data;
                        const bodyDecoded = base64.decode(
                            bodyBase64.replace(/-/g, '+').replace(/_/g, '/')
                        );

                        // Find target string w/ 🐶 name via some group matching
                        // Name is second group
                        const pattern = new RegExp(
                            /(Congratulations!) (.*) has received an adoption inquiry/g
                        );
                        const strMatches = pattern.exec(bodyDecoded);
                        const pupName = strMatches[2];

                        console.log('Pup name', pupName, Dog.findOne);

                        // Find if dog is pending in db by greedy partial name match, 
                        // which accounts for other things in dog name
                        try {
                            const dogResult = await Dog.findOne({
                                name: {
                                    $regex: pupName,
                                    $options: "i"
                                }
                            }, 'name pending -_id').exec();
                            console.log(dogResult)
                        } catch (err) {
                            throw new Error(err);
                        }

                        res.send('Logged in');

                    }
                });
            } else {
                console.log('Inbox empty.');
            }
        } catch (e) {
            throw new Error(`The API returned an error: ${e.toString()}`);
        }
    }
});

app.get('/auth/google/callback', function (req, res) {
    const code = req.query.code;
    if (code) {
        // Get an access token based on our OAuth code
        oAuth2Client.getToken(code, function (err, tokens) {
            if (err) {
                console.log('Error authenticating');
                console.log(err);
            } else {
                console.log('Successfully authenticated');
                oAuth2Client.setCredentials(tokens);
                authed = true;
                res.redirect('/');
            }
        });
    }
});

const port = process.env.port || 3000;
app.listen(port, () => console.log(`Server running at ${port}`));
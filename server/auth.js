
const fs = require('fs');
const assert = require('assert')
const {google} = require('googleapis');
const {response} = require('express');
const OAuth2 = google.auth.OAuth2;
const OAuth2Data=require("./client_secret.json")
// const oauth2Strategy=require("passport-google-oauth2").Strategy;
// const { generateAuthUrl } = require('./auth');
// module.exports.generateAuthUrl = generateAuthUrl;


var CREDENTIALS;
let GLOBAL_OAUTH_CLIENT;
const SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
].reduce((p, v) => p + " " + v, '').trim()

function init() {
    console.log('Initing')
    // Load client secrets from a local file.
    fs.readFile('./client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        CREDENTIALS = JSON.parse(content)
        //console.log(CREDENTIALS)
        GLOBAL_OAUTH_CLIENT = authorize({...getCredentials()})
    });
}

function getGlobalClient() {
    return GLOBAL_OAUTH_CLIENT;
}

function getCredentials() {
    return CREDENTIALS;
}


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
    const clientSecret = credentials.web.client_secret;
   const clientId = credentials.web.client_id;
    const redirectUrl = credentials.web.redirect_uris[0];
    const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    return oauth2Client
 }


  // @param {google.auth.OAuth2} //oauth2Client The OAuth2 client to get token for.
  // @param {getEventsCallback} //callback The callback to call with the authorized
//      client.
 

function getAuthUrl(oauth2Client) {
  
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline', //humlog online v rkh skte h for more authentication
        scope: SCOPES
        
    });

    return authUrl;
}

function handleAuthCode(oauth2Client, code, callback) {
    return oauth2Client.getToken(code, function (err, res) {
        if (err) {
            console.log('Error while trying to retrieve access token', err);
            return;
        }
        //storeToken(token);
        oauth2Client.setCredentials({
            access_token: res.access_token, 
        })
        callback(oauth2Client, res);
    });
}

function fetchUserInfo(client, callback) {
    const oauth2 = google.oauth2({
        version: 'v2',
        auth: client,
    })
    oauth2.userinfo.get((err, res) => {
        callback(res.data, client, oauth2, err)
    })
}

function fetchUserInfoAsync(client) {
    return new Promise((resolve, reject) => {
        fetchUserInfo(client, (user, client, oauth2, err) => {
            if (err) {
                reject({code: 'ClientError', err})
            } else {
                resolve(user, client, oauth2)
            }
        })
    });
}


function getCredentials()  {
    return CREDENTIALS
}

init()






module.exports = {
    CREDENTIALS, getCredentials, getGlobalClient, authorize, getAuthUrl, handleAuthCode, fetchUserInfo, fetchUserInfoAsync
}
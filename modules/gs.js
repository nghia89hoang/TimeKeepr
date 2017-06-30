const fs = require('fs')
const readline = require('readline')
const google = require('googleapis')
const googleAuth = require('google-auth-library')

// READ & WRITE
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const TOKEN_DIR = (process.env.HOME || 
                    process.env.HOMEPATH ||
                    process.env.USERPROFILE) + '/.credentials/'
const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json'

var GoogleSheet = {
    oauth2Client: {},
    defaultSheet: {},
    currentSheetId: '',
    authorize: function(credentials, callback) {
        const clientSecret = credentials.installed.client_secret
        const clientID = credentials.installed.client_id
        const redirectUrl = credentials.installed.redirect_uris[0]
        const auth = new googleAuth()
        this.oauth2Client = new auth.OAuth2(clientID, clientSecret, redirectUrl)

        fs.readFile(TOKEN_PATH, (err, token)=>{
            if(err) {
                this.getNewToken(oauth2Client, callback)
            } else {
                this.oauth2Client.credentials = JSON.parse(token)
                callback(this.oauth2Client)
            }
        })
    },
    storeToken: function(token) {
        try {
            fs.mkdirSync(TOKEN_DIR);
        } catch (err) {
            if (err.code != 'EXIST') {
            throw err;
            }
        }
        fs.writeFile(TOKEN_PATH, JSON.stringify(token));
        console.log('Token stored to ' + TOKEN_PATH);
    },
    getNewToken: function(oauth2Client, callback) {
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        console.log('Authorize this app by visiting this url: ', authUrl);
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ', function(code) {
            rl.close();
            oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            this.storeToken(token);
            callback(oauth2Client);
            });
        });
    },
    init: function(callback){
        fs.readFile('client_secret.json', (err, content) => {
            if(err) {
                console.log('Err loading secrets: ' + err)
                return;
            }
            this.authorize(JSON.parse(content), callback)
        })
    },
    setCurrentSheet: function(newSheetId) {
        this.currentSheetId = newSheetId
    },
    appendArrData: function(range, dataArr, options, callback) {
        var sheets = google.sheets('v4');
        sheets.spreadsheets.values.append({
            auth: this.oauth2Client,
            spreadsheetId: this.currentSheetId,
            range: range,
            valueInputOption: (options && options.valueInputOption) || 'USER_ENTERED',
            insertDataOption: (options && options.insertDataOption) || 'INSERT_ROWS',
            resource: {
                majorDimension: 'ROWS',
                values:[dataArr]
            }
        }, (err, resp)=> {
            if(callback) {
                return callback(err, resp)
            }
            if(err) {
                console.log('Sheet error:', err)
                throw err
            }
        })
    },
// {
//   "range": string,
//   "majorDimension": enum(Dimension),
//   "values": [
//     array
//   ],
// }
    getData: function(range, callback) {
        var sheets = google.sheets('v4')
        sheets.spreadsheets.values.get({
            auth: this.oauth2Client,
            spreadsheetId:this.currentSheetId,
            range: range
        }, (err, resp) => {
            if(callback) {
                return callback(err, resp)
            }
            if(err) {
                console.log('Sheet Error: ', err)
                throw err
            }
        })
    }
}

module.exports = GoogleSheet
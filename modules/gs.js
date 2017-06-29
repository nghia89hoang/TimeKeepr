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

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */


function listMajors(auth) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    // '1srJf69S1i7PlpoAUlHnlI76DWISNPyx3mLAKemiooMc'
    // '1BsxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
    spreadsheetId: '1srJf69S1i7PlpoAUlHnlI76DWISNPyx3mLAKemiooMc',
    range: 'Sheet1!A3',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      console.log('Return data:');
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        console.log('%s', row[0]);
      }
    }
  });
}

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
    getData: function(range, options, callback) {
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
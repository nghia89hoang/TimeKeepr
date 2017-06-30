const env = require('./config/env')
const restify = require('restify')
const builder = require('botbuilder')
const gs = require('./modules/gs')
const Bot = require('./bot/bot')

const server = restify.createServer()
gs.init((auth) => {
    console.log('Google sheet initialized...')
    gs.setCurrentSheet('1srJf69S1i7PlpoAUlHnlI76DWISNPyx3mLAKemiooMc')
    console.log('Done init google sheet!')
})

server.listen(process.env.port || process.env.PORT || 4040, function() {
    console.log(`${server.name} listening to ${server.url}`)
})

var connector = new builder.ChatConnector({
    appId: env.MICROSOFT_APP_ID,
    appPassword: env.MICROSOFT_APP_PASSWORD
})

server.post('/api/messages', connector.listen())
const bot = Bot(connector, {gs})
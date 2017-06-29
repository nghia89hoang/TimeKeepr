const restify = require('restify')
const builder = require('botbuilder')
const env = require('./env')

const gs = require('./modules/gs')
const commandParser = require('./modules/commandParser')
// const processor = require('./modules/commandProcessor')

const contactRelationUpdate = require('./bot/contactRelationupdate')
const conversationUpdate = require('./bot/conversationUpdate')
const mainDialog = require('./bot/mainDlg')


const server = restify.createServer()
console.log('Init google sheet...')
gs.init((auth) => {
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

var bot = new builder.UniversalBot(connector)
server.post('/api/messages', connector.listen())

// middleware
bot.use({
    botbuilder: function(session, next) {
        // messageResponse(session, next)
        let cmd = commandParser(session)
        session.userData.cmd = cmd
        if(cmd.error.code == 0) {
            next()
        } else if(cmd.error.code > 0) {
            session.send(`${cmd.error.msg}`)
            return
        } else {
            console.log(`Normal chat: ${session.message.text}`)
        }
    },
    send: function(event, next) {
        console.log(event.text)
        next()
    }
})
bot.dialog('/', mainDialog({gs}))
bot.on('contactRelationUpdate', contactRelationUpdate({bot}))
bot.on('conversationUpdate', conversationUpdate({bot}))

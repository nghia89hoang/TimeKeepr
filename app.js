const restify = require('restify')
const builder = require('botbuilder')
const env = require('./env')
const gs = require('./modules/gs')
const commandParser = require('./modules/commandParser')
const processor = require('./modules/commandProcessor')

// const gCheckInOutRegex = /#(in|out){1} ?(([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]))?/i

const server = restify.createServer()

server.listen(process.env.port || process.env.PORT || 4040, function() {
    console.log('Init google sheet...')
    gs.init((auth) => {
        // console.log(`Init: ${JSON.stringify(auth)}`);
        gs.setCurrentSheet('1srJf69S1i7PlpoAUlHnlI76DWISNPyx3mLAKemiooMc')
        console.log('Done init google sheet!')
    })
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
bot.dialog('/', function(session) {
    let cmd = session.userData.cmd
    var date = new Date(cmd.timestamp)
    // var dateStr = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`
    var dateStr = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`
    var newData = [dateStr, cmd.usrName, cmd.action.toUpperCase() ,`${cmd.hh}:${cmd.mm}`]
    var newKey = `${dateStr}:${cmd.usrName}:${cmd.action}`
    if(cmd.action == 'in') {
        processor.checkIn(newKey, newData, (err, result)=> {
            if(err) {
                console.log("Error: " + err)
                return
            }
            console.log("Result: " + result)
        })
    } else {
        processor.checkOut(newKey, newData, (err, result)=> {
            if(err) {
                console.log("Error: " + err)
                return
            }
            console.log("Result: " + result)
        })
    }
    gs.appendArrData('A2', newData)
    session.send(`Confirm: @${cmd.usrName} [${cmd.action}] at [${cmd.hh}:${cmd.mm}]`)
})

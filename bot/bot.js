const builder = require('botbuilder')
const contactRelationUpdate = require('./contactRelationupdate')
const conversationUpdate = require('./conversationUpdate')
const mainDialog = require('./mainDlg')

const commandParser = require('../modules/commandParser')

module.exports = (connector, cfg) => {
    var gs = cfg.gs
    var bot = new builder.UniversalBot(connector)
    // middleware
    bot.use({
        botbuilder: [commandParser],
        send: [(event, next) => {next()}]
    })
    bot.dialog('/', mainDialog({gs}))
    bot.on('contactRelationUpdate', contactRelationUpdate({bot}))
    bot.on('conversationUpdate', conversationUpdate({bot}))
    return bot
}

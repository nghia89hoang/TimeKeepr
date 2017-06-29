const builder = require('botbuilder')

module.exports = function(cfg) {
    var bot = cfg.bot
    return (message) => {
        if(message.action = 'add') {
            var name = message.user ? message.user.name : null
            var reply = new builder.Message()
                            .address(message.address)
                            .text(`Hello ${name || 'there'}..., thanks for adding me.`)
            bot.send(reply)
        }
        if(message.action = 'remove') {
            bot.send('Goodbye all!!')
        }
    }
}
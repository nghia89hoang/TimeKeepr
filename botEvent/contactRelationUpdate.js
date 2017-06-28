const builder = require('botbuilder')

module.exports = function(message) {
    if(message.action = 'add') {
        var name = message.user ? message.user.name : null
        var reply = new builder.Message()
                        .address(message.address)
                        .text(`Hello ${name || 'there'}..., thanks for adding me.`)
        
    }
}
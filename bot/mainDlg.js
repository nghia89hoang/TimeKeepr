const processor = require('../modules/commandProcessor')

module.exports = function(cfg){
    console.log('TEST ESTT TSET TEST')
    processor.init(cfg)
    processor.on('in', (err, res)=>{
        if(err) {
            console.log('Err: ', err.message)
            if(res.session) {
                res.session.send(`Command error: ${err.message}`)
            }
            return
        }
        var cmd = res.cmd
        if(res.session) {
            res.session.send(`IConfirm: @${cmd.usrName} [${cmd.action}] at [${cmd.param}]`)
        }
    })
    processor.on('out', (err, res)=>{
        var cmd = res.cmd
        if(res.session) {
            res.session.send(`OConfirm: @${cmd.usrName} [${cmd.action}] at [${cmd.param}]`)
        }
    })
    return (session) => {
        let cmd = session.userData.cmd
        processor.processCommand(cmd, session)
    }
}
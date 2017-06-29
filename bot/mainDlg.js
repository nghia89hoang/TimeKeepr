const processor = require('../modules/commandProcessor')
var gs
module.exports = function(cfg){
    gs = cfg.gs
    return (session) => {
        let cmd = session.userData.cmd
        var date = new Date(cmd.timestamp)
        var dateStr = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`
        var newData = [dateStr, cmd.usrName, cmd.action.toUpperCase() ,`${cmd.param}`]
        var newKey = `${dateStr}:${cmd.usrName}:${cmd.action}`
        console.log('Command received: ', JSON.stringify(cmd))
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
        session.send(`Confirm: @${cmd.usrName} [${cmd.action}] at [${cmd.param}]`)
    }
}
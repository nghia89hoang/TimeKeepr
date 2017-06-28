let CommandInf = {
    error: {
        code: 0,
        msg: ''
    },
    timestamp: '',
    usrName: '',
    usrId: '',
    action: '', // in or out
    hh: '',
    mm: ''
}
const gCheckInOutRegex = /#(in|out){1} ?(([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]))?/i

module.exports = function parseCommand(session) {
    let cmdArr
    var cmd = Object.create(CommandInf)
    let msg = session.message.text
    // cmdArr = gCheckInOutRegex.exec(msg)
    cmdArr = msg.match(gCheckInOutRegex)
    // if(gCheckInOutRegex.test(msg)) {
    
    // console.log(`Arr: ${cmdArr}`)
    if(cmdArr && cmdArr.length > 0) {
        if(cmdArr[2] && cmdArr[2] != ''){
            // session.send(`${session.message.timestamp}:${session.message.user.name}:[${cmdArr[1]}:${cmdArr[2]}:${cmdArr[3]}]`)            
            cmd.error.code = 0
            cmd.timestamp = session.message.timestamp
            cmd.usrName = session.message.user.name
            cmd.usrId = session.message.user.id
            cmd.action = cmdArr[1]
            cmd.hh = cmdArr[3]
            cmd.mm = cmdArr[4]
        } else {
            cmd.error.code = 1;
            cmd.error.msg = `"${cmdArr[0]}..." not a valid command!`
        }
    } else {
        cmd.error.code = -1;
        cmd.error.msg = 'Not a command'
    }
    return cmd
}
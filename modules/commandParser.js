let CommandInf = {
    error: {
        code: 0,
        msg: ''
    },
    timestamp: '',
    usrName: '',
    usrId: '',
    action: '', // in or out
    param: ''
}
const gTimePattern = /([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])/i
const gCheckInOutPattern = /(in|out)/i
const gCommandPattern = /^#(\w+){1} +([\S ]+)/i

module.exports = function parseCommand(session, next) {
    let cmdArr
    var cmd = Object.create(CommandInf)
    let msg = session.message.text
    // cmdArr = gCheckInOutRegex.exec(msg)
    cmdArr = msg.match(gCommandPattern)
    // if(gCheckInOutRegex.test(msg)) {
    console.log(`Arr: ${cmdArr}`)
    if(cmdArr && cmdArr.length > 0) {
        // session.send(`${session.message.timestamp}:${session.message.user.name}:[${cmdArr[1]}:${cmdArr[2]}:${cmdArr[3]}]`)            
        cmd.error.code = 0
        cmd.timestamp = session.message.timestamp
        cmd.usrName = session.message.user.name
        cmd.usrId = session.message.user.id
        cmd.action = cmdArr[1]
        cmd.param = cmdArr[2] || ''
    } else {
        cmd.error.code = -1;
        cmd.error.msg = 'Not a command'
    }
    if(cmd.error.code == 0) {
        session.userData.cmd = cmd
        return next()
    } else if(cmd.error.code > 0) {
        session.send(`.${cmd.error.msg}`)
    } else {
        console.log(`Normal chat: ${session.message.text}`)
    }
    session.userData.cmd = null
}
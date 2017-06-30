const redis = require('./redisMgr')()
const gTimePattern = /([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])/i
// const multi = redis.multi()
module.exports = {
    gs: null,
    cbList: {},
    session: {},
    init: function(cfg) {
        console.log('Init command processor: ' + JSON.stringify(cfg))
        this.gs = cfg.gs
        return this
    },
    on: function(action, callback) {
        console.log(`Assigning new callback ${callback} for Event: ${action}`)
        this.cbList[action] = callback
    },
    _in: function(cmd) {
        var times = cmd.param.match(gTimePattern)
        console.log(`CheckIn @: ${times}`)
        var res = {
            cmd,
            session: this.session
        }
        if(!times) {
            return this.cbList['in'](new Error(`Invalid time: ${cmd.param}`), res)
        }
        var date = new Date(cmd.timestamp)
        var dateStr = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`
        var newData = [dateStr, cmd.usrName, cmd.action.toUpperCase() ,`${cmd.param}`]
        // var newKey = `${dateStr}:${cmd.usrName}:${cmd.action}`
        this.gs.appendArrData('A2', newData, null, (err, resp) => {
            // console.log(`Sheet response: ${JSON.stringify(resp)}`)
            var res = {
                cmd,
                session: this.session
            }
            if(this.cbList['in']) {
                this.cbList['in'](err, res)
            }
        })
    },
    _out: function(cmd) {
        console.log(`CheckOut ${cmd.param}`)
        var res = {
            cmd,
            session: this.session
        }
        if(this.cbList['out']) {
            this.cbList['out'](null, res)
        }
    },
    processCommand: function(cmd, session) {
        this.session = session
        console.log('Command received: ', JSON.stringify(cmd))
        var date = new Date(cmd.timestamp)
        var dateStr = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`
        if(this[`_${cmd.action}`]) {
            this[`_${cmd.action}`](cmd)
        }
    }
}

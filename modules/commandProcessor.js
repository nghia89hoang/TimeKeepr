const redis = require('./redisMgr')()
const multi = redis.multi()

exports.checkIn = function (key, arrVal, callback){
    console.log(`CheckIn ${arrVal}`)
    for(var i = 0; i < arrVal.length; i++) {
        multi.rpush(key, arrVal[i])
    }
    console.log("Key: "+key)
    multi.exec(callback)
    redis.expire(key, 120)
}

exports.checkOut = function (key, arrVal, callback) {
    console.log(`CheckOut ${arrVal}`)
}
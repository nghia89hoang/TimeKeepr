const redis = require('redis')

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'
const REDIS_PORT = process.env.REDIS_PORT || '6379'

function initRedisMgr(callback) {
    const client = redis.createClient(REDIS_PORT, REDIS_HOST)
    client.on('connect', function(){
        console.log(`Connect to Redis server @: ${REDIS_HOST}:${REDIS_PORT}`)
        if(callback) {
            callback()
        }
    })
    client.on('error', function(err) {
        console.log("Error: " + err)
        if(callback) {
            callback(err)
        }
    })
    return client
}
module.exports = initRedisMgr
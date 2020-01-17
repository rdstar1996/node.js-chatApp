const redis = require('redis')
const redisClientImageDB =  redis.createClient({host:'localhost',port:'6379',return_buffers:true,db:0})
const redisClientUsernameDB = redis.createClient({host:'localhost',port:'6379',db:1})
module.exports.redisClientUsernameDB = redisClientUsernameDB
module.exports.redisClientImageDB = redisClientImageDB
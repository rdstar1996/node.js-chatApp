const mongoose  = require('mongoose')
const Schema  = mongoose.Schema

const roomSchema  = new Schema({
    roomName:{
        required:true,
        type:String
    },
    roomDesc:{
        required:true,
        type:String
    },
    imageName:{
        required:true,
        type:String
    }
})

module.exports = mongoose.model('RoomDetails',roomSchema)
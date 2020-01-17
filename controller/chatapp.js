const {redisClientImageDB,redisClientUsernameDB} = require('../utills/redis-client-utils')
const sharp = require('sharp')
const Room = require('../models/room')
exports.getRoomPage = (req,res,next)=>{
    console.log("admin val"+req.session.isAdmin)
    var isAdmin = req.session.isAdmin
    var allRooms=[]
    Room.find()
    .then(allRooms=>{
        if(allRooms)
        {
            res.render('roompage',
            {
                isAdmin:isAdmin,
                roomData:{
                    allRooms:allRooms,
                }
            })    
        }
    })
    .catch(err =>{
        console.log(err)
    })
}
exports.getRoomFormPage = (req,res,next)=>{
    var prodId = req.query.id
    var edit = req.query.edit
    console.log(prodId)
    console.log(edit)
    if(edit && prodId)
    {
        Room.findById(prodId).then(room=>{
            res.render('roomcreationpage',{edit:edit,room:room})
        })
    }
    else
    {
        res.render('roomcreationpage',{edit:false,room:null})
    }
}
exports.postRoomFormPage = (req,res,next)=>{
   var roomName = req.body.roomName
   var roomDesc = req.body.roomDesc
   var roomImageFile = req.file
   if(roomImageFile)
   {
       sharp(roomImageFile['buffer'])
       .webp({quality:70})
       .toBuffer()
       .then(bufferVal =>{
           return new Promise((resolve,reject)=>{
               if(redisClientImageDB.set(roomImageFile["originalname"],bufferVal))
               {
                   resolve(true)
               }
               else
               {
                   reject(false)
               }
           })
       })
       .then(isDone=>{
           if(isDone)
           {
               const room  = new Room({
                   roomName:roomName,
                   roomDesc:roomDesc,
                   imageName:roomImageFile["originalname"]
               })
               return room.save()
           }
       })
       .then(result=>{
        res.redirect('/chatapp')
       })
   }
   
}
exports.getChatPage = (req,res,next)=>{
    const roomName = req.params.roomName
    //console.log('profile name'+profileImage)
    var uriString64 =""
    const redisClientPromise = new Promise((resolve,reject)=>{
        redisClientImageDB.get(req.session.imageName,(err,reply)=>{
            if(reply)
            {
                resolve(reply)
            }
            else
            {
                reject(err)
            }
        })
    })
    redisClientPromise
    .then(bufferVal =>{
        return sharp(bufferVal).toBuffer()
    })
    .then(sharpBuffer =>{
        uriString64 = sharpBuffer.toString('base64')
        let socket_id = [];
        const io = req.app.get('socketio');
        io.on('connection',(socket)=>{
            console.log('connection on :'+socket.id)
            socket_id.push(socket.id)
            if(socket_id[0]==socket.id)
            {
                io.removeAllListeners('connection'); 
            }
            socket.userName = req.session.userName
            socket.join(roomName)
            var clientObjAdd =JSON.stringify( {"username":socket.userName,"profileImage":req.session.imageName})
            redisClientUsernameDB.hset(roomName,clientObjAdd,socket.id)
            redisClientUsernameDB.hkeys(roomName,(err,allClients)=>{
                if(allClients)
                {
                    console.log(allClients.toString('utf-8'))
                    io.to(roomName).emit('clientList',allClients)
                }
                else
                {
                    console.log("err isnside redisClientUsernameDB")
                    console.log(err)
                }
            })
            socket.on('disconnect',()=>{
                console.log('socket with id:'+socket.id+'disconnected')
                socket_id.pop()
                var clientObjDel =JSON.stringify( {"username":req.session.userName,"profileImage":req.session.imageName})
                redisClientUsernameDB.hdel(roomName,clientObjDel)
                redisClientUsernameDB.hkeys(roomName,(err,allClients)=>{
                    if(allClients)
                    {
                        io.to(roomName).emit('clientList',allClients)
                    }
                    else
                    {
                        console.log("err isnside redisClientUsernameDB disconnect")
                        console.log(err)
                    }
                })
            })
            socket.on("sendMessage",(message)=>{
                socket.broadcast.to(roomName).emit("broadcastMsg",{"sender":socket.userName,"message":message})
            })
        })
        res.render('chatpage',{string64:uriString64,userName:req.session.userName,roomName:roomName})
    })
    .catch(err=>{
        console.log("error in chatapp controller")
        console.log(err)
    })
    
}

exports.getImage = (req,res,next)=>{
    var filename = req.params.path
    console.log(req.params.path)
    redisClientImageDB.get(filename,(err,reply)=>{
        sharp(reply).jpeg().toBuffer((err,buffer)=>{
            res.write(buffer,'binary');
            res.end(null,'binary')
        })
    })
}

exports.postLogout = (req,res,next)=>{
    req.session.destroy(()=>{
        console.log('session destroyed')
        res.redirect('/')
    })
}

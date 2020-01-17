const express = require('express')
const router  = express.Router()
const chatController = require('../controller/chatapp')
const isAuth = require('../middleware/is-auth')
router.get('/',isAuth,chatController.getRoomPage)
router.get('/createRoom',isAuth,chatController.getRoomFormPage)
router.post('/createRoom',isAuth,chatController.postRoomFormPage)
router.post('/logout',isAuth,chatController.postLogout)
router.get('/room/:roomName',isAuth,chatController.getChatPage)
router.get('/image/:path',isAuth,chatController.getImage)

module.exports = router
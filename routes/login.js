const express = require('express')
const loginController = require('../controller/login')
const router = express.Router()

router.get('/',loginController.getLogin)

router.post('/',loginController.postLogin)

router.get('/signup',loginController.getSignup)

router.post('/signup',loginController.postSignup)

module.exports = router;
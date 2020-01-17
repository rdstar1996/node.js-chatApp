const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer  = require('multer')
const cookieParser = require('cookie-parser')
const http = require('http')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
//PACKAGE IMPORTS
const loginRoute = require('./routes/login')
const chatRoute = require('./routes/chatapp')
//ROUTES
const URI = "mongodb+srv://root-ritwik:7oD7TqtbaWmCJoCY@cluster0-317nw.mongodb.net/RitwikApp"
const app = express()
const sessionStore = new MongoDBStore({uri:URI,collection:'sessions'})
const server = http.createServer(app)
const io = require('socket.io')(server)
const storageBuffer  = multer.memoryStorage()

app.set('view engine', 'ejs');
app.set('views', 'views');
app.set('socketio', io);
app.use(cookieParser())
app.use(session({secret:'my secret', resave:false,saveUninitialized:false,store:sessionStore}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage:storageBuffer}).single('imageFile'))
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',loginRoute)
app.use('/chatapp',chatRoute)

mongoose
.connect("mongodb+srv://root-ritwik:7oD7TqtbaWmCJoCY@cluster0-317nw.mongodb.net/RitwikApp?retryWrites=true&w=majority")
.then(result=>{
    server.listen(4000,()=>{
    console.log("server is running at port 4000...")
    })
})
.catch(err=>{
    console.log(err)
})

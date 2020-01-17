const User = require('../models/user')
const bcrypt = require('bcryptjs')
const sharp = require('sharp')
const {redisClientImageDB,redisClientUsernameDB} = require('../utills/redis-client-utils')
exports.getLogin=(req,res,next)=>{
    res.render('login')
}
exports.postLogin = (req,res,next)=>{
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    User.findOne({email:userEmail})
    .then(user=>{
        if(!user)
        {
            return res.redirect('/')
        }
        else
        {
            bcrypt.compare(userPassword,user.password)
            .then(doMatch=>{
                if(doMatch)
                {
                    // const cookieVal = "room=".concat(user.imageName)
                    // res.setHeader('Set-Cookie',cookieVal)
                    req.session.isLoggedIn = true
                    req.session.userName = user.userName;
                    req.session.imageName = user.imageName;
                    req.session.isAdmin = user.isAdmin
                    // res.cookie("userName",user.imageName)
                    return req.session.save(err=>{
                        console.log(err)
                        res.redirect('/chatapp')
                    })  
                }
                else
                {
                    return res.redirect('/')
                }
            })
            .catch(err =>{
                console.log(err)
            })
        }
    })
    .catch(err=>{
        console.log(err)
    })
}

exports.getSignup=(req,res,next)=>{
    res.render('signup')
}

exports.postSignup=(req,res,next)=>
{
    console.log(req.body)
    let firstName = req.body.firstname
    let lastName = req.body.lastname
    let userName = req.body.username
    let email = req.body.email
    let image = req.file
    let admin = req.body.role
    let password = req.body.password
    let confirmPassword = req.body.confirmpassword
    let adminVal = false
    if(image)
    {
        sharp(image["buffer"])
        .webp({quality:70})
        .toBuffer()
        .then(value=>{
            return new Promise((resolve,reject)=>{
                if(redisClientImageDB.set(image["originalname"],value))
                {
                    resolve(true)
                }
                else
                {
                    reject(false)
                }
            })
        })
        .then(saved=>{
            if(saved)
            {
                console.log("buffer saved")
            }
        })
        .catch(err=>{
            console.log(err)
        })
    }
    if(admin)
    {
        adminVal = true
    }
    if(password === confirmPassword)
    {
        bcrypt.hash(password,12)
        .then(excryptedPassword=>{
            const user= new User({
                firstName:firstName,
                lastName:lastName,
                userName:userName,
                email:email,
                imageName:image["originalname"],
                isAdmin:adminVal,
                password:excryptedPassword
            })
            return user.save()
        })
        .then(savedResult=>{
            console.log("user saved")
            res.redirect('/')
        })
        .catch(err=>{
            console.log(err)
        })
    }
}
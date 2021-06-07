const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt') 
const fs = require('fs')
const  {validationResult} = require('express-validator')

const index = (req, res) => {
    res.render("homePage/home")
}
  

const login_get = (req, res) => {
    const error = req.flash('error') || ''
    const password = req.flash('password') || ''
    const email = req.flash('email') || ''
    res.render('handleLogin/login',{error, password, email})
  }


const login_post = (req, res) => {
    let result = validationResult(req);
    if(result.errors.length === 0){
        let {email,password} = req.body
        console.log("email  "+email)
        let acc = undefined
        User.findOne({email:email})
        .then(acc=>{
            account = acc
            return bcrypt.compare(password,acc.password)
        })
        .then(passwordMatch=>{
            if(passwordMatch){
                jwt.sign({
                    email:account.email,
                    name:account.name
                },process.env.JWT_SECRET,{
                    expiresIn:'30s'
                },(err,token)=>{
                    if(err) throw err
                    console.log("token :"+token) 
                })
                return res.render("homePage/home")
            }
            else{
                return res.render("handleLogin/login",{error:"Sai email hoặc password",email:email,password:password})
            }
        })
    .catch(e=>{return res.render("handleLogin/login",{error:"Sai email hoặc password",email:email,password:password})})
    }else{
        result = result.mapped()
    
        let message;
        for (fields in result ){
            message = result[fields].msg
            break;    
        }
    
        const { email, password} = req.body
    
        req.flash('error',message)
        req.flash('password',password)
        req.flash('email',email)
        res.redirect('/')
    }

      
    
}



const register_get = (req, res) => {
    const error = req.flash('error') || ''
    const name = req.flash('name') || ''
    const email = req.flash('email') || ''
    const password = req.flash('password') || ''
    res.render('handleLogin/signup',{error, name, email, password})
}



const register_post = (req, res) => {
    let result = validationResult(req);
    if(result.errors.length === 0){
        const {name, email, password} = req.body
        User.findOne({email:email})
        .then(acc =>{
            if(acc){
                throw new Error('Tài khoản này đã tồn tại email')
            }
        })
        .then(()=> bcrypt.hashSync(password,10))
        .then(hashed =>{
            let user = new User({
                name:req.body.name,
                email: req.body.email,
                password: hashed
            })
            return user.save()
        })
        .then( () => {
           return res.redirect('/')
        })
        .catch(error =>{
            res.render('handleLogin/signup',{error:"Email này đã tồn tại",name:name,email:email,password:password})
        })
    
    }else{
        result = result.mapped()
    
        let message;
        for (fields in result ){
            message = result[fields].msg
            break;    
        }
    
        const {name, email, password} = req.body
    
            req.flash('error',message)
            req.flash('name',name)
            req.flash('email',email)
        req.flash('password',password)
        res.redirect('/register')
    }
       
    
}


  
module.exports = {
    index,
    login_get,
    login_post,
    register_get,
    register_post
}








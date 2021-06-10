const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt') 
const fs = require('fs')
const session = require('express-session');
const  {validationResult} = require('express-validator')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy



// trang home
const index = (req, res) => {
    res.render('homePage/home')
}
  
// display form login
const login_get = (req, res) => {
    const error = req.flash('error') || ''
    const password = req.flash('password') || ''
    const email = req.flash('email') || ''
    res.render('handleLogin/login',{error, password, email})
  }

// Login local 
passport.use(new LocalStrategy({
    usernameField:'email'
},
function(username, password, done) {
    User.findOne({ email: username })
    .then(data=>{
        account = data
        if(!data){
            done(null,false)
        }
        else{
            bcrypt.compare(password,account.password)
            .then((result)=>{
                if(result){
                    done(null,data)
                }
                else{
                    done(null,false)
                }
            })
        }
      
    })
    .catch(err=>{
        console.log("catch  "+err)
        done(err)
    })
}
  ));
// post login
const login_post = (req, res,next) => {
    let result = validationResult(req);
    let {email,password} = req.body
    if(result.errors.length === 0){
        passport.authenticate('local', function(err, user) {
            if (err) { return res.render('handleLogin/login',{error:"Tài khoản không tồn tại",email:email,password:password}); }
            if (!user) { return res.render('handleLogin/login',{error:"Sai email hoặc password",email:email,password:password}); }
            jwt.sign(user.toObject(),process.env.JWT_SECRET,{expiresIn:'15s'},function(err,token){
                if(err){
                    return res.render('handleLogin/login',{error:"Lỗi server",email:user.email,password:user.password});
                }
                else{
                    res.cookie('token',token)
                    res.redirect('/');
                }
            })

          })(req, res, next)
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
        res.redirect('/login')
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

const profile_get = (req, res) => {
    res.render('profile/myProfile')
}

const message_get = (req, res) => {
    res.render('homePage/sendMessage')
}
  
module.exports = {
    index,
    login_get,
    login_post,
    register_get,
    register_post,
    profile_get,
    message_get
}








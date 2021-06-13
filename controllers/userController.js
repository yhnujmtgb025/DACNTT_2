const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt') 
const fs = require('fs')
const path = require('path');
const session = require('express-session');
const  {validationResult} = require('express-validator')
const passport = require('passport');
const nodemailer = require('nodemailer')
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
/* 


  
*/

// trang home
const index = (req, res) => {
    if(!req.session.user){
        return res.redirect('/login')
    }
    res.render('homePage/home')
}
  
// display form login
const login_get = (req, res) => {
    if(req.session.user){
       return  res.redirect('/')
    }
    const error = req.flash('error') || ''
    const password = req.flash('password') || ''
    const email = req.flash('email') || ''
    res.render('handleLogin/login',{error, password, email})
  }


// post login
const login_post = (req, res,next) => {
    let result = validationResult(req);
    let {email,password} = req.body
    if(result.errors.length === 0){
        passport.authenticate('local', function(err, user) {
            if (err) { return res.render('handleLogin/login',{error:"Tài khoản không tồn tại",email:email,password:password}); }
            if (!user) { return res.render('handleLogin/login',{error:"Tài khoản không tồn tại",email:email,password:password}); }
            if (!user.password || !user.email) { return res.render('handleLogin/login',{error:"Sai email hoặc password",email:email,password:password}); }
            req.session.user = user
            res.redirect('/')
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


//logout
const logout_get = (req, res) => {
   req.session.destroy();
   res.redirect('/login'); 
}



const register_get = (req, res) => {
    const error = req.flash('error') || ''
    const name = req.flash('name') || ''
    const email = req.flash('email') || ''
    const password = req.flash('password') || ''
    res.render('handleLogin/signup',{error, name, email, password})
}



const register_post =  (req, res,next) => {
    let result = validationResult(req);
    if(result.errors.length === 0){
        const {name, email, password} = req.body
        User.findOne({email:email})
        .then(acc =>{
            if(acc){
                res.render('handleLogin/signup', {
                    error:"Email này đã được đăng kí",
                    name:name,
                    email:email,
                    password:password
                });
            } else {
                const oauth2Client = new OAuth2(
                    process.env.GMAIL_CLIENT_ID, // ClientID
                    process.env.GMAIL_CLIENT_SECRET, // Client Secret
                    "https://developers.google.com/oauthplayground" // Redirect URL
                );
                oauth2Client.setCredentials({
                    refresh_token: process.env.REFRESH_TOKEN
                });
                const accessToken = oauth2Client.getAccessToken()

                const token = jwt.sign({ name, email, password }, process.env.JWT_SECRET, { expiresIn: '30m' });
                const CLIENT_URL = 'http://' + req.headers.host;

                const output = `
                <h2>Please click on below link to activate your account</h2>
                <p>${CLIENT_URL}/activate/${token}</p>
                <p><b>NOTE: </b> The above activation link expires in 30 minutes.</p>
                `;

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: "OAuth2",
                        user: "m70058158@gmail.com",
                        clientId: process.env.GMAIL_CLIENT_ID,
                        clientSecret:process.env.GMAIL_CLIENT_SECRET,
                        refreshToken: process.env.REFRESH_TOKEN,
                        accessToken: accessToken
                    },
                });

                // send mail with defined transport object
                const mailOptions = {
                    from: '"Auth Admin" <m70058158@gmail.com>', // sender address
                    to: email, // list of receivers
                    subject: "Account Verification: NodeJS Auth ✔", // Subject line
                    generateTextFromHTML: true,
                    html: output, // html body
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        res.render('handleLogin/signup',{error:"Something went wrong on our end. Please register again.",name:name,email:email,password:password});
                    }
                    else {
                        console.log('Mail sent : %s', info.response);
                        req.flash(
                            'success_msg',
                            'Activation link sent to email ID. Please activate to log in.'
                        );
                        res.redirect('/register');
                    }
                })

            }
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

const handle_activity = (req,res)=>{
    const token = req.params.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
            req.flash('error','Incorrect or expired link! Please register again.')
            res.redirect('/register');
            }
            else {
                const { name, email, password } = decodedToken;
                User.findOne({ email: email })
                .then(user => {
                    if (user) {
                        //------------ User already exists ------------//
                        req.flash('error', 'Email ID already registered! Please log in.');
                        res.redirect('/login');
                    } 
                })
                .then(()=> bcrypt.hashSync(password,10))
                .then(hashed =>{
                    let user = new User({
                        username:name,
                        email: email,
                        password: hashed,
                        role:1,
                    })
                    return user.save()
                })
                .then( () => {
                    return res.redirect('/')
                })
                .catch(error =>{
                    res.render('handleLogin/signup',{error:"Email này đã tồn tại",name:name,email:email,password:password})
                })
            }

        })
    }
    else {
        res.render('handleLogin/signup',{error:"Account activation error!",name:"",email:"",password:""})
    }
}

const forgot_get = (req,res)=>{
    const email = req.flash('email') || ''
    const error = req.flash('error') || ''
    req.flash('error_msg',"Lỗi reset")
    res.render("handleLogin/forget",{error,email:email})
}

const forgot_post = (req,res)=>{
    const {email} = req.body
    let result = validationResult(req);
    if(result.errors.length === 0){
        const { email } = req.body;
        User.findOne({ email: email })
        .then(user => {
                if (!user) {
                    res.render('handleLogin/forget', {error:"Không tồn tại email này",email:email});
                } else {
                    const oauth2Client = new OAuth2(
                        process.env.GMAIL_CLIENT_ID, // ClientID
                        process.env.GMAIL_CLIENT_SECRET, // Client Secret
                        "https://developers.google.com/oauthplayground" // Redirect URL
                    );
    
                    oauth2Client.setCredentials({
                        refresh_token: process.env.REFRESH_TOKEN
                    });
                    const accessToken = oauth2Client.getAccessToken()
    
                    const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET, { expiresIn: '30m' });
                    const CLIENT_URL = 'http://' + req.headers.host;
                    const output = `
                    <h2>Please click on below link to reset your account password</h2>
                    <p>${CLIENT_URL}/forget/${token}</p>
                    <p><b>NOTE: </b> The activation link expires in 30 minutes.</p>
                    `;
                  
                User.updateOne({ resetLink: token }, (err, success) => {
                    if (err) {
                        res.render('handleLogin/forget', {error:"Lỗi reset",email});
                    }
                    else {
                     
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                type: "OAuth2",
                                user: "m70058158@gmail.com",
                                clientId: process.env.GMAIL_CLIENT_ID,
                                clientSecret:process.env.GMAIL_CLIENT_SECRET,
                                refreshToken: process.env.REFRESH_TOKEN,
                                accessToken: accessToken
                            },
                        });
                        // send mail with defined transport object
                        const mailOptions = {
                            from: '"Auth Admin" <m70058158@gmail.com>', // sender address
                            to: email, // list of receivers
                            subject: "Account Verification: NodeJS Auth ✔", // Subject line
                            generateTextFromHTML: true,
                            html: output, // html body
                        };
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                res.render('handleLogin/forget',{error:"Something went wrong on our end. Please reset again.",email:email});
                            }
                            else {
                                console.log('Mail sent : %s', info.response);
                                req.flash(
                                    'success_msg',
                                    'Activation link sent to email ID. Please activate to log in.'
                                );
                                res.redirect('/forget');
                            }
                        })
                    }
                })
    
                }
        });
    
    }else{
        result = result.mapped()
    
        let message;
        for (fields in result ){
            message = result[fields].msg
            break;    
        }
        req.flash('error',message)
        req.flash('email',email)
        res.redirect('/forget')
    }
}

//------------ Redirect to Reset Handle ------------//

const forgot_activity=(req,res)=>{
    const { token } = req.params;
    if (token) {
        jwt.verify(token, process.env.JWT_RESET, (err, decodedToken) => {
            if (err) {
                req.flash(
                    'error_msg',
                    'Incorrect or expired link! Please try again.'
                );
                res.redirect('/forget');
            }
            else {
                const { _id } = decodedToken;
                User.findById(_id, (err, user) => {
                    if (err) {
                        req.flash(
                            'error_msg',
                            'User with email ID does not exist! Please try again.'
                        );
                        res.redirect('/forget');
                    }
                    else {
                        res.redirect(`/reset/${_id}`)
                    }
                })
            }
        })
    }
    else {
        console.log("Password reset error!")
    }
}

const reset_get=(req,res)=>{
    const error = req.flash('error') || ''
    console.log("id : "+req.params.id)
    res.render('handleLogin/resetPassword', { id: req.params.id,password:"",error})
}

const reset_post=(req,res)=>{
    let result = validationResult(req);
    var { password, rePassword } = req.body;
    passNew = bcrypt.hashSync(password,10)
    const id = req.params.id;
    if(result.errors.length === 0){
                User.findByIdAndUpdate({ _id: id}, {password:passNew },function (err, result) {
                    if (err) {
                        req.flash(
                            'error_msg',
                            'Error resetting password!'
                        );
                        console.log("err "+err)
                        res.redirect(`/reset/${id}`);
                    } else {
                        req.flash(
                            'success_msg',
                            'Password reset successfully!'
                        );
                        res.redirect('/login');
                    }
                })
                
    }
    else{
        result = result.mapped()
        let message;
        for (fields in result ){
            message = result[fields].msg
            break;    
        }
    
        const { password,rePassword} = req.body
     
            req.flash('error',message)
            req.flash('password',password)
            res.redirect(`/reset/${_id}`)
    }

}


const profile_get = (req, res) => {
    if(!req.session.user){
        return res.redirect('/login')
    }
    res.render('profile/myProfile')
}

const message_get = (req, res) => {
    res.render('homePage/sendMessage')
}
  
module.exports = {

    index,
    login_get,
    login_post,
    logout_get,
    register_get,
    register_post,
    forgot_get,
    forgot_post,
    forgot_activity,
    reset_get,
    reset_post,
    handle_activity,
    profile_get,
    message_get
}








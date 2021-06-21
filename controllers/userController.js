const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt') 
const fs = require('fs')
const formidable = require("formidable");
const path = require('path');
const session = require('express-session');
const  {validationResult} = require('express-validator')
const passport = require('passport');
const nodemailer = require('nodemailer')
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const form = formidable({ multiples: true });

// trang home
const index = (req, res) => {
    if(!req.session.user){
        req.flash('')
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
    const password = req.flash('password','') || ''
    const email = req.flash('email') || ''
    res.render('handleLogin/login',{error,password, email})
  }


// post login
const login_post = (req, res,next) => {
    let result = validationResult(req);
    let {email,password} = req.body
    if(result.errors.length === 0){
        passport.authenticate('local', function(err, user) {
            if (err) { 
                res.render('/login',{error:"Sai email hoặc password",email:email,password:password}); 
            }
            if (!user) { 
                return res.render('handleLogin/login',{error:"Sai email hoặc password",email:email,password:password}); 
            }
            req.session.user = user
            // console.log("req "+req.session.user )
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


// trang đăng kí
const register_get = (req, res) => {
    const error = req.flash('error') || ''
    const name = req.flash('name') || ''
    const email = req.flash('email') || ''
    const password = req.flash('password') || ''
    const success = req.flash('success') || ''
    res.render('handleLogin/signup',{error,success,name, email, password})
}



const register_post =  (req, res,next) => {
    let result = validationResult(req);
    if(result.errors.length === 0){
        const {name, email, password} = req.body
        User.findOne({email:email})
        .then(acc =>{
            if(acc){
                req.flash('error','Email này đã được đăng kí')
                req.flash('name',name)
                req.flash('email',email)
                req.flash('password',password)
                res.redirect('/register')
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
                        console.log("  err  "+error)
                        res.render('handleLogin/signup',{error:"Đã xảy ra lỗi khi đăng kí, vui lòng thử lại",name:name,email:email,password:password,success:""});
                    }
                    else {
                        console.log('Mail sent : %s', info.response);
                        req.flash('success','Hãy vào mail để xác nhận đăng kí');
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

// hàm active
const handle_activity = (req,res)=>{
    const token = req.params.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if (err) {
            req.flash('error','Link đã hết hạn, vui lòng thử lại')
            res.redirect('/register');
            }
            else {
                const { name, email, password } = decodedToken;
                User.findOne({ email: email })
                .then(user => {
                    if (user) {
                        //------------ User already exists ------------//
                        req.flash('error', 'Email này đã đăng kí vui lòng thử lại');
                        res.redirect('/login');
                    } 
                })
                .then(()=> bcrypt.hashSync(password,10))
                .then(hashed =>{
                    let user = new User({
                        fullname:name,
                        email: email,
                        password: hashed,
                        profileImage:"/img/default.jpg",
                        bio:"",
                        name:"",
                        role:1,
                    })
                    return user.save()
                })
                .then( () => {                  
                    return res.redirect('/')
                })
                .catch(error =>{
                    res.render('handleLogin/signup',{error:error,name:name,email:email,password:password})
                })
            }

        })
    }
    else {
        res.render('handleLogin/signup',{error:"Lỗi kích hoạt tài khoản",name:"",email:"",password:""})
    }
}

// trang forget

const forgot_get = (req,res)=>{
    const email = req.flash('email') || ''
    const error = req.flash('error') || ''
    const success = req.flash('success') || ''
    res.render("handleLogin/forget",{error,success,email:email})
}

const forgot_post = (req,res)=>{
    const {email} = req.body
    let result = validationResult(req);
    if(result.errors.length === 0){
        const { email } = req.body;
        User.findOne({ email: email })
        .then(user => {
                if (!user) {
                    req.flash('error','Không tồn tại email này')
                    req.flash('email',email)
                    res.redirect('/forget')
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
                        req.flash('error','Lỗi reset, vui lòng thử lại')
                        res.redirect('/forget')
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
                                req.flash('error',"Đã xảy ra lỗi vui lòng thử lại");
                                res.redirect('/forget');                            }
                            else {
                                console.log('Mail sent : %s', info.response);
                                req.flash('success',"Hãy vào email để xác nhận");
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
                req.flash('error','Link đã hết hạn, vui lòng thử lại !');
                res.redirect('/forget');
            }
            else {
                const { _id } = decodedToken;
                User.findById(_id, (err, user) => {
                    if (err) {
                        req.flash('error','Không tồn tại email này, vui lòng thử lại !');
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
        req.flash('error','Lỗi token, vui lòng thử lại');
        res.redirect('/forget');
    }
}

const reset_get=(req,res)=>{
    const error = req.flash('error') || ''
    const password = req.flash('password') || ''
    const rePassword =   req.flash('rePassword') || ''
    res.render('handleLogin/resetPassword', { id: req.params.id,password:"",error:error,password:password,rePassword:rePassword})
}

const reset_post=(req,res)=>{
    let result = validationResult(req);
    var { password, rePassword } = req.body;
    passNew = bcrypt.hashSync(password,10)
    const id = req.params.id;
    if(result.errors.length === 0){
                User.findByIdAndUpdate({ _id: id}, {password:passNew },function (err, result) {
                    if (err) {
                        req.flash('error','Lỗi khi reset, vui lòng thử lại');
                        req.flash('password',password);
                        req.flash('rePassword',rePassword);
                        res.redirect(`/reset/${id}`);
                    } else {
                        req.flash('success','Password đã được thay đổi');
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
            req.flash('rePassword',rePassword)
            res.redirect(`/reset/${id}`)
    }

}


// trang profile
const profile_get = (req, res) => {
    if(!req.session.user){
        return res.redirect('/login')
    }
    User.findOne({_id:req.session.user._id},function(err,user){
        res.render('profile/myProfile',{image:user.profileImage,fullname:user.fullname,bio:user.bio,name:user.name})
    })
}

// change photo
const profile_post = (req, res) => {
    var id= req.session.user._id;

    form.parse(req);
    form.on('file', function (name, file){
        User.findByIdAndUpdate({ _id: id}, {profileImage:'/img/'+file.name },function (err, result) {
            if (err) {
                res.json({
                    "status": "500",
                    "message": "error",
                    data:err
                });
            } else {
                res.json({
                    "status": "200",
                    "message": "Profile image has been updated.",
                    data: '/img/'+file.name
                });
            }
        })
    });
   
}


// update profile
const edit_profile_get = (req, res) => {
    if(!req.session.user){
        return res.redirect('/login')
    }
    User.findOne({_id:req.session.user._id},function(err,user){
        res.render('profile/editProfile',{image:user.profileImage,fullname:user.fullname,bio:user.bio,name:user.name})
    })
}

const edit_profile_post = (req, res) => {
    var id= req.session.user._id;
    var {fullname,bio,name} = req.body
    console.log("fi  "+fullname)
    User.findByIdAndUpdate({ _id: id}, {fullname:fullname,bio:bio,name:name},function (err, result) {
        if (err) {
            res.end("Lỗi hệ thống!")
        } else {
            res.json({
                data: {
                    name:name,
                    fullname:fullname,
                    bio:bio
                }
            });
        }
    })
}

// reset password
const change_password_get = (req, res) => {
    if(!req.session.user){
        return res.redirect('/login')
    }
    var email = req.session.user.email
    const error = req.flash('error') || ''
    const password = req.flash('password') || ''
    const rePassword =   req.flash('rePassword') || ''
    const oldPass =   req.flash('oldPass') || ''
    const success = req.flash('success') || ''
    User.findOne({_id:req.session.user._id},function(err,user){
        res.render('profile/changePass',{image:user.profileImage,error:error,password:password,oldPass:oldPass,rePassword:rePassword,success,email:email,fullname:user.fullname})
    })
}

const change_password_post = (req,res)=>{
    if(!req.session.user){
        return res.redirect('/login')
    }
    const {oldPass,password,rePassword,email} = req.body
    const hash_password =  bcrypt.hashSync(password,10)
    let result = validationResult(req);
    if(result.errors.length === 0){
        User.findOne({
            email: email
        }).then(user => {
            if (!user) {
                req.flash('error','Không tồn tại email này');
                res.redirect('/login');
            }
            bcrypt.compare(oldPass,user.password)
            .then((result)=>{
                if(result){
                    User.updateOne({email: email},{password:hash_password},function (err, result) {
                        if (err) {
                            req.flash('error','Lỗi khi thay đổi, vui lòng thử lại');
                            req.flash('oldPass',oldPass);
                            req.flash('password',password);
                            req.flash('rePassword',rePassword);
                            res.redirect('/myProfile/editProfile/changePassword');
                        } else {
                            req.flash('success','Password đã được thay đổi');
                            res.redirect('/myProfile/editProfile/changePassword');
                        }
                    })
                }
                else{
                    req.flash('error','Sai mật khẩu, vui lòng nhập lại');
                    req.flash('oldPass',oldPass);
                    req.flash('password',password);
                    req.flash('rePassword',rePassword);
                    res.redirect('/myProfile/editProfile/changePassword');
                }
            })
        });
    
    }else{
        result = result.mapped()
    
        let message;
        for (fields in result ){
            message = result[fields].msg
            break;    
        }
        req.flash('error',message)
        req.flash('oldPass',oldPass);
        req.flash('password',password);
        req.flash('rePassword',rePassword);
        res.redirect('/myProfile/editProfile/changePassword');
    }
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
    profile_post,

    edit_profile_get,
    edit_profile_post,

    change_password_get,
    change_password_post,
    message_get
}








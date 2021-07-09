const User = require('../models/UserModel');
const Post = require('../models/PostModel');
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt') 
const fs = require('fs')

const path = require('path');
const session = require('express-session');
const  {validationResult} = require('express-validator')
const passport = require('passport');
const nodemailer = require('nodemailer')
const { google } = require("googleapis");
const { rejects } = require('assert');
const OAuth2 = google.auth.OAuth2;

const multer  = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/demo')
    },
    filename: function (req, file, cb) {
      // cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[1])
       cb(null,file.originalname)
    }
})
const upload = multer({storage: storage})

// trang home
const index = (req, res) => {
    if(!req.session.user){
        req.flash('')
        return res.redirect('/login')
    }
    var user = req.session.user
    var use = ''
    if(user.fullname){
        user = [].concat(req.session.user)
        user=user[0]
    }else{
        console.log("2")
        for(var i = 0; i < user.length;i++){
            if(user[i].followings.length > 0){
                user = [].concat(user[i])
                user = user[0]
            }else{
                user = [].concat(user[i])
                user = user[0]
            }
        }
    }
    var name =""
    if(user.name!=""){
        name = user.name
    }
    User.collection.find({
    })
    .limit(5)
    .toArray(function(err,data){
        res.render('homePage/home',{image:user.profileImage,fullname:user.fullname,name:name,idCurrent:user._id,data:data,curUser:user})
    })
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
                    }
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
                        followings:[],
                        followers:[]
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
    User.collection.find({_id:ObjectId(req.session.user._id)})
    .toArray( function(err,user){
        var lengthPost = 0;
        var like=0
        var post =[]
        console.log("user\n",user)
        for(var i = 0;i<user.length;i++){
            image=user[i].profileImage
            fullname=user[i].fullname
            bio = user[i].bio
            name=user[i].name
            if(user[i].posts && user[i].posts != null && user[i].posts != undefined){
                for(var j =0;j<user[i].posts.length;j++){
                    post = user[i].posts
                    like = user[i].posts[j].likers.length    
                }
            }
        }        
        if(like == ""){
            like = 0
        }
        res.render('profile/myProfile',{
            image:image,
            fullname:fullname,
            bio:bio,
            name:name,
            post:post,
            like:like
        })
    })
 

}

// change photo
const profile_post = (req, res) => {
    var id= req.session.user._id;
    let uploader = upload.single('file-')
    uploader(req,res,err=>{
    req.session.user.profileImage = '/demo/'+req.file.filename
    User.updateOne({ _id: id}, {$set:{'profileImage':'/demo/'+req.file.filename}},function (err, result) {
        if (err) {
            return res.send("Loi");
        }
        Post.collection.updateMany({'user._id':ObjectId(id)}, {$set: { "user.profileImage" :'/demo/'+req.file.filename }})
        return res.json({data: '/demo/'+req.file.filename})
        
    })
    
    })
}

// user profile
const user_profile_post = (req, res) => {
    var reqUser = [].concat(req.session.user)
    var current_user = reqUser[0]
    var id = req.body._id
    User.collection.findOne({
        _id:ObjectId(id)
    },function(err,user){
        if(err){
            req.flash('error',err)
            return res.redirect('/')
        }else if(user == null){
            req.flash('error',"Vui lòng đăng nhập lại !")
            return res.redirect('/login')
        }else{
            var isFollowed = false
            var idfollow = ''
            var idNotice = ''
            for(var i = 0;i < user.followers.length;i++){
                var follower = user.followers[i]
                if(follower.idFollower.toString() == current_user._id.toString()){
                    idfollow = follower._id
                    idNotice = user.notifications[i]._id
                    isFollowed = true
                    break;
                } 
            }
            if(isFollowed){
               User.collection.updateOne(
                {
                    "_id":ObjectId(user._id)
                },{
                    $pull:{
                        "followers":{
                            "_id":idfollow
                        },
                        "notifications":{
                            "_id":idNotice
                        }
                    }
                },function(err,data){
                    User.collection.updateOne({
                          "_id": ObjectId(current_user._id)
                      }, {
                        $pull: {
                          "followings": {
                            "idFollowing":ObjectId(user._id)
                          }
                        }
                      },function(err,data){
                        let result = req.session.user[0]
                        if(result){
                            for( var i = 0; i < req.session.user[0].followings.length; i++){ 
                                if ( req.session.user[0].followings[i].idFollowing.toString() === user._id.toString()) { 
                                    req.session.user[0].followings.splice(i, 1); 
                                    i--; 
                                }
                            }
                        }else{
                            req.session.user.followings = []
                        }

                        res.json({
                            "status": "unfollow"
                          });
                      });
                    
                })
            }else{
                User.collection.updateOne({
                    "_id": ObjectId(user._id)
                }, {
                    $push: {
                        "followers": {
                            "_id": ObjectId(),
                            "idFollower":ObjectId(current_user._id),
                            "fullname": current_user.fullname,
                            "name": current_user.name,
                            "profileImage": current_user.profileImage,
                            "type": "follower",
                            "createdAt": new Date().getTime()
                        },
                        "notifications": {
                            "_id": ObjectId(),
                            "idFollowed":ObjectId(current_user._id),
                            "type": "follower",
                            "content": current_user.fullname + " has followed your !",
                            "profileImage": current_user.profileImage,
                            "createdAt": new Date().getTime()
                        }
                    }
                },function (error, data) {
                    User.collection.updateOne(
                        { 
                          "_id": ObjectId(current_user._id)
                        }, { 
                            $push: 
                              { 
                                "followings": {
                                  "_id": ObjectId(),
                                  "idFollowing":ObjectId(user._id),
                                  "fullname": user.fullname,
                                  "name": user.name,
                                  "profileImage": user.profileImage,
                                  "type": "following",
                                  "createdAt": new Date().getTime()
                                }
                              } 
                        },function (error, success) {
                            if (error) {
                                console.log(error);
                            } else {
                                let product = {
                                    "_id": ObjectId(),
                                    "idFollowing":ObjectId(user._id),
                                    "fullname": user.fullname,
                                    "name": user.name,
                                    "profileImage": user.profileImage,
                                    "type": "following",
                                    "createdAt": new Date().getTime()
                                }
                                var c =[].concat(req.session.user)
                                req.session.user = c
                                // console.log(req.session.user[0])
                                req.session.user[0].followings.push(product)
                                // console.log("\n jo",req.session.user[0].followings[0])
                                res.json({
                                    "status": "follow"
                                });
                            }
                        }
                    )

               });
            }
        }
    })
}

const user_profile_get = (req, res) => {
    var id = req.params.id
    console.log("idgets:             "+id)
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
    req.session.user.fullname = fullname
    req.session.user.name = name
    User.findByIdAndUpdate({ _id: id}, {fullname:fullname,bio:bio,name:name},function (err, result) {
        if (err) {
            res.end("Lỗi hệ thống!")
        } else {
            Post.collection.updateMany({'user._id':ObjectId(id)}, {
                $set: 
                { 
                    "user.name" :name,
                    "user.fullname": fullname
                }
             })
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

    user_profile_get,
    user_profile_post,

    edit_profile_get,
    edit_profile_post,

    change_password_get,
    change_password_post,
    message_get
}








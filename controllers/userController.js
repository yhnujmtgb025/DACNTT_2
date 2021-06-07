const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt') 
const fs = require('fs')
const  validationResult = require('express-validator')

class LoginController{

    // [GET] /login
    main(req, res) {
        const error = req.flash('error')
        const message = req.flash('message')
        
        res.render('handleLogin/login');
    }

    
}

module.exports = new LoginController();




// const login_post = (req, res) => {
//     let result = validationResult(req);
//     if(result.errors.length === 0){
//         const { email, password} = req.body
        
//         const sql = 'SELECT * FROM account WHERE email = ?' 
//         const params = [email]

//         db.query(sql,params,(err,results,fields)=>{
//             if(err){
//                 req.flash('error',err.message)
//                 req.flash('email',email)
//                 req.flash('password',email)
//                 return res.redirect('/user/login')
//             }else if (result.length===0){
//                 req.flash('error','email ko ton tai')
//                 req.flash('email',email)
//                 req.flash('password',email)
//                 return res.redirect('/user/login')
//             }else{
//                 const hased = results[0].password
//                 const match = bcrypt.compareSync(password,hased)
//                 if(!match){
//                     req.flash('error','Mat khau khong chinh xac')
//                     req.flash('email',email)
//                     req.flash('password',email)
//                     return res.redirect('/login')
//                 }else{
//                     // delete result[0].password
//                     let user = results[0]
//                     user.userRoot = `${req.vars.root}/users/${user.email}`
//                     req.session.user = user
                    
//                     // dang ki phuc vu thu muc goc cua user
//                     req.app.use(express.static(user.userRoot))


//                     return res.redirect('/')
//                 }
//             }
//         })
//     }
//     else{
//         result = result.mapped()
//         console.log(result)
    
//         let message;
//         for (fields in result ){
//             message = result[fields].msg
//             break;    
//         }
    
//         const { email, password} = req.body
    
//         req.flash('error',message)
//         req.flash('password',password)
//         req.flash('email',email)
//         res.redirect('/user/login')
//     }
// }



// const register_get = (req, res) => {
//     const error = req.flash('error') || ''
//     const name = req.flash('name') || ''
//     const email = req.flash('email') || ''
//     res.render('register',{error, name, email})
// }

// const register_post = (req, res) => {
//     let result = validationResult(req);
//     console.log(result)
//     if(result.errors.length === 0){
//         const {name, email, password} = req.body
//         const hased = bcrypt.hashSync(password,10)
        
//         const userNew = new User(req.body);
//         userNew.save()
//         .then(result => {
//         res.redirect('/blogs');
//         })
//         .catch(err => {
//         console.log(err);
//         });

//         const params = [name,email,hased]

//         db.query(sql,params,(err,results,fields)=>{
//             if(err){
//                 req.flash('error',err.message)
//                 req.flash('name',name)
//                 req.flash('email',email)
//                 return res.redirect('/user/register')
//             }
//             else if(results.affectedRows === 1){
//                 const {root} = req.vars // tach root ra de su dung
//                 const userDir = `${root}/users/${email}`
//                 fs.mkdir(userDir,()=>{
//                     return res.redirect('/user/login')
//                 })
//             }
//             else{
//             req.flash('error','Dang ki that bai')
//             req.flash('name',name)
//             req.flash('email',email)
//             return res.redirect('/user/register')
//             }

//         })
    
//     }
//     else{
//         result = result.mapped()
//         console.log(result)
    
//         let message;
//         for (fields in result ){
//             message = result[fields].msg
//             break;    
//         }
    
//         const {name, email, password} = req.body
    
//         req.flash('error',message)
//         req.flash('name',name)
//         req.flash('email',email)
//         res.redirect('/user/register')
//     }
// }


  
// module.exports = {
//     login_get,
//     login_post,
//     register_get,
//     register_post
// }


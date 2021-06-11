const jwt = require('jsonwebtoken') 
const User = require('../models/UserModel');

// module.exports = (req,res,next)=>{
//         var toke = req.cookies.token
        
//         jwt.verify(toke, process.env.JWT_SECRET, function(err, decoded) {
//             if(err){
//                 console.log("decode  "+decoded)
//                 return res.redirect('/login')
//             }
            
//             User.findOne({
//                 _id:decoded._id
//             })
//             .then(data=>{
//                 if(data){
//                     req.data = data
//                     next()
//                 }else{
//                     return res.redirect('/login')
//                 }
//             })
//             .catch(err=>{
//                 return res.redirect('/')
//             }) 
//         });
// }
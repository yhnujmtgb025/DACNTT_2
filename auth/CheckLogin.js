const jwt = require('jsonwebtoken') 
const User = require('../models/UserModel');

module.exports = (req,res,next)=>{
    try {
        var toke = req.cookies.token
        var idUser =  jwt.verify(toke,process.env.JWT_SECRET)
        User.findOne({
            _id:idUser
        })
        .then(data=>{
            if(data){
                req.data = data
                next()
            }else{
                return res.redirect('/login')
            }
        })
        .catch(err=>{
            return res.redirect('/')
        })
    } catch (error) {
        return res.redirect('/login')
    }
    
     
}
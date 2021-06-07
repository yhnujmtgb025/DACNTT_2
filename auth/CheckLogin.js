const jwt = require('jsonwebtoken')


module.exports = (req, res, next )=>{
    const {token} = req.body
    console.log("token "+token)
    const {JWT_SECRET} = process.env.JWT_SECRET
    if(!token){
        return res.render("handleLogin/login", {error:"",email:"",password:""})
    }
    jwt.verify(token,JWT_SECRET,(err,data)=>{
        if(err){
            return res.render("handleLogin/login", {error:"",email:"",password:""})
        }
        console.log(" ko co loi")
        req.user = data 
        next();
    })
}

module.exports = (req,res,next)=>{
    var role = req.data.role
    if(role >= 1){
        next()
    }else{
        return res.redirect("/")
    }
}
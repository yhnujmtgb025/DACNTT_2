
module.exports = (req,res,next)=>{
    var role = req.data.role
    if(role >= 2){
        next()
    }else{
        return res.redirect("/")
    }
}
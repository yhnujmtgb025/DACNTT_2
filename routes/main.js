const session = require('express-session');
const flash = require('express-flash')

const UserRouter = require('./UserRouter');


function route(app) {
    app.use('/',UserRouter)
  
    // app.use('/logout', (req, res) => {
    //     req.logout();
    //     req.session.destroy();
    //     res.redirect('/login');
    // })
    
    // app.get('/', function (req, res) {
    //     res.render('homePage/home')
    //   })
    //   app.get('/login', function (req, res) {
    //     res.render('handleLogin/login')
    //   })
    //   app.get('/forget', function (req, res) {
    //     res.render('handleLogin/forget')
    //   })
    //   app.get('/signup', function (req, res) {
    //     res.render('handleLogin/signup')
    //   })
      
      // app.get('/listUnfollow', function (req, res) {
      //   res.render('homePage/listUnfollow')
      // })
      // app.get('/sendMessage', function (req, res) {
      //   res.render('homePage/sendMessage')
      // })
      
      // app.get('/savePost', function (req, res) {
      //   res.render('homePage/savePost')
      // })
      
      // app.get('/myProfile', function (req, res) {
      //   res.render('profile/myProfile')
      // })
      
      // app.get('/myProfile/saved', function (req, res) {
      //   res.render('profile/saved')
      // })
      // app.get('/myProfile/editProfile', function (req, res) {
      //   res.render('profile/editProfile')
      // })
}

module.exports = route
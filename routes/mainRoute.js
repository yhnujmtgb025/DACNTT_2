const checkLogin = require('../auth/CheckLogin')
const checkAdmin = require('../auth/CheckAdmin')
const checkUser = require('../auth/CheckUser')

const UserController = require('../controllers/UserController')


const loginValidator = require('../validators/loginValidator')
const registerValidator = require('../validators/registerValidator')

function route(app) {
    
    app.get('/',UserController.index );


    app.get('/login', UserController.login_get );
    app.post('/login',loginValidator,UserController.login_post );
    app.get('/register', UserController.register_get );
    app.post('/register', registerValidator,UserController.register_post );

    app.get('/sendMessage',checkLogin,checkUser,UserController.message_get  );
    app.get('/myProfile',checkLogin,checkAdmin,UserController.profile_get  );

}

module.exports = route
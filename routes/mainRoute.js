const checkAdmin = require('../auth/CheckAdmin')
const { ensureAuthenticated,forwardAuthenticated} = require('../auth/checkUser')

const UserController = require('../controllers/UserController')


const loginValidator = require('../validators/loginValidator')
const registerValidator = require('../validators/registerValidator')
const forgotValidator = require('../validators/forgotValidator')
const resetValidator = require('../validators/resetValidator')

function route(app) {
    app.get('/',UserController.index );

    app.get('/login', UserController.login_get );
    app.post('/login',loginValidator,UserController.login_post );
    app.get('/logout',UserController.logout_get)

    app.get('/register', UserController.register_get );
    app.post('/register', registerValidator,UserController.register_post );
    app.get('/activate/:token',UserController.handle_activity );

    app.get('/forget',UserController.forgot_get );
    app.post('/forget',forgotValidator,UserController.forgot_post );
    app.get('/forget/:token',UserController.forgot_activity );
    app.get('/reset/:id',UserController.reset_get );
    app.post('/reset/:id',resetValidator,UserController.reset_post );

    app.get('/sendMessage',UserController.message_get  );

    app.get('/myProfile',UserController.profile_get  );

    app.get('/myProfile/editProfile',UserController.edit_profile_get  );
    app.get('/myProfile/editProfile/changePassword',UserController.change_password_get  );
    app.post('/myProfile/editProfile/changePassword',resetValidator,UserController.change_password_post  );
}


module.exports = route
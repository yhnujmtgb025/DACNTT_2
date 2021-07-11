const checkAdmin = require('../auth/CheckAdmin')
const { ensureAuthenticated,forwardAuthenticated} = require('../auth/checkUser')




const UserController = require('../controllers/UserController')
const PostController = require('../controllers/PostController')

const loginValidator = require('../validators/loginValidator')
const registerValidator = require('../validators/registerValidator')
const forgotValidator = require('../validators/forgotValidator')
const resetValidator = require('../validators/resetValidator')

function route(app) {
    app.get('/',UserController.index );


    // handle newfeed
    app.post('/addPost',PostController.post_Newfeed );
    app.post("/getNewsfeed", PostController.get_Newfeed);

    app.post("/toggleLike",PostController.post_ToggleLike);
    
    // notification
    app.post("/getNotice", PostController.get_Notice);
    app.post("/postNotice", PostController.post_Notice);

    // handle login
    app.get('/login', UserController.login_get );
    app.post('/login',loginValidator,UserController.login_post );
    app.get('/logout',UserController.logout_get)

    // handle register
    app.get('/register', UserController.register_get );
    app.post('/register', registerValidator,UserController.register_post );
    app.get('/activate/:token',UserController.handle_activity );

    // handle forget
    app.get('/forget',UserController.forgot_get );
    app.post('/forget',forgotValidator,UserController.forgot_post );
    app.get('/forget/:token',UserController.forgot_activity );
    app.get('/reset/:id',UserController.reset_get );
    app.post('/reset/:id',resetValidator,UserController.reset_post );

    app.get('/sendMessage',UserController.message_get);

    // handle profile
    app.get('/myProfile',UserController.profile_get  );
    app.post('/myProfile/changePhoto',UserController.profile_post  );

    app.get('/myProfile/editProfile',UserController.edit_profile_get  );
    app.post('/myProfile/editProfile',UserController.edit_profile_post  );

    app.get('/userProfile/:id',UserController.user_profile_get);
    app.post('/userFollow',UserController.user_follow_post);
    
    // list follow
    app.get('/homePage/listFollow',UserController.user_follow);

    // handle password 
    app.get('/myProfile/editProfile/changePassword',UserController.change_password_get  );
    app.post('/myProfile/editProfile/changePassword',resetValidator,UserController.change_password_post  );
}


module.exports = route
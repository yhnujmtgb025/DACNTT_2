const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

//------------ Local User Model ------------//
const User = require('../models/UserModel');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            //------------ User Matching ------------//
            User.findOne({
                email: email
            }).then(user => {
                if (!user) {
                    return done(null, false);
                }

                //------------ Password Matching ------------//
                bcrypt.compare(password,user.password)
                .then((result)=>{
                    if(result){
                        done(null,user)
                    }
                    else{
                        done(null,false)
                    }
                })
            });
        })
    );

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};
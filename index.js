require('dotenv').config();
const passport = require('passport');
require('./auth/passport')(passport);
const express = require('express');
const path = require('path');
const socketio = require('socket.io')
const session = require('express-session');
const FormData = require('form-data');
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken');
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieParser = require('cookie-parser');
const flash = require('express-flash');

const methodOveride = require('method-override')
const { io } = require("./utils/socket");


const db = require('./config/database/connect');
const User = require('./models/UserModel');

const route = require('./routes/mainRoute');
const { ConnectionStates } = require('mongoose');

db.connect();

const app = express();


app.set('view engine', 'ejs')
app.set('io', io)
app.get('io')
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({
  extended: true,
}));

app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});
app.use(express.json());
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' ,
  cookie: { 
    secure:false,
    maxAge: 1000000 }
}));

app.use(cookieParser('keyboard cat'));
app.use(flash());

app.use(function(req, res, next) {
  if (!req.user)
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  next();
});

app.use(passport.initialize());  // khởi tạo chế độ passport
app.use(passport.session());


// routes

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
// used to deserialize the user
passport.deserializeUser(function (id, done) {
  User.findById(id)
  .then((user)=>{
    done(null,user)
  })

});

// active để hiển thị form login google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile','email'] }))
// Login Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `http://localhost:${process.env.PORT}/auth/google/callback`
},
function(accessToken, refreshToken, profile, cb) {
  User.findOne({email: profile.emails[0].value}, function (err, user) {
    if (err){
      return cb(err);
    }
    if (user) {
        // if a user is found, log them in
        return cb(null, user);
    } else {
        // if the user isnt in our database, create a new user
        var newUser = new User();
        // set all of the relevant information
        newUser.id = profile.id;
        newUser.username = profile.displayName;
        newUser.email = profile.emails[0].value; // pull the first email
        newUser.role = 1;
        // save the user
        newUser.save(function (err) {
            if (err){
              throw err;
            }
            return cb(null, newUser);
        });
    }
});

}
));
// handle data trả về
app.get('/auth/google/callback',
  passport.authenticate('google'),
  (req, res, next)=>{
      if (!req.user) { 
        return res.redirect('/login') 
      }
      req.session.user = req.user
      res.redirect('/')
  }
)

app.use(function(req,res,next){
  res.io = io;
  next();
  })
app.io = io
route(app)









const port = process.env.PORT || 8080

const server =  app.listen(port, ()=>console.log(`http://localhost:${port}`))
io.attach(server);



require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const socketio = require('socket.io');

const route = require('./routes/main');
const db = require('./config/database/connect');


db.connect();

const app = express();


app.set('view engine', 'ejs')
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
  cookie: { maxAge: 1000000 }
}));

app.use(cookieParser('keyboard cat'));
app.use(flash());


// app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser(function(user, cb) {
//   cb(null, user);
// });

// passport.deserializeUser(function(obj, cb) {
//   cb(null, obj);
// });

// routes

route(app)



const port = process.env.PORT || 8080
app.listen(port, ()=>console.log(`http://localhost:${port}`))
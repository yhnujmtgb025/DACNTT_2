const express = require('express');
const Router = express.Router();
require('dotenv').config();
const passport = require('passport');

const CheckLogin = require('../auth/CheckLogin')
const UserController = require('../controllers/UserController')
const User = require('../models/UserModel')
const loginValidator = require('../validators/loginValidator')
const registerValidator = require('../validators/registerValidator')



Router.get('/',CheckLogin ,UserController.index );
Router.get('/login', UserController.login_get );
Router.post('/login',loginValidator,UserController.login_post );
Router.get('/register', UserController.register_get );
Router.post('/register', registerValidator,UserController.register_post );

module.exports = Router;
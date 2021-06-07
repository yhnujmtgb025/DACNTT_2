const express = require('express');
const Router = express.Router();
require('dotenv').config();
const passport = require('passport');
const {check} = require('express-validator')

const UserController = require('../controllers/userController')
const User = require('../models/UserModel')

const loginValidator = [

    check('email').exists().withMessage('Vui long nhap email user')
    .notEmpty().withMessage('Khong duoc de trong email nguoi dung')
    .isEmail().withMessage('Day ko phai la email hop le'),

    check('password').exists().withMessage('Vui long nhap mat khau')
    .notEmpty().withMessage('Khong duoc de trong password')
    .isLength({min:6}).withMessage('Mat khau phai tu 6 ki tu'),

]

const registerValidator = [
    check('name').exists().withMessage('Vui long nhap ten user')
    .notEmpty().withMessage('Khong duoc de trong ten nguoi dung')
    .isLength({min:6}).withMessage('Ten nguoi dung phai tu 6 ki tu'),

    check('email').exists().withMessage('Vui long nhap email user')
    .notEmpty().withMessage('Khong duoc de trong email nguoi dung')
    .isEmail().withMessage('Day ko phai la email hop le'),

    check('password').exists().withMessage('Vui long nhap mat khau')
    .notEmpty().withMessage('Khong duoc de trong password')
    .isLength({min:6}).withMessage('Mat khau phai tu 6 ki tu'),

    check('rePassword').exists().withMessage('Vui long nhap xac nhan mat khau')
    .notEmpty().withMessage('Vui long nhap xac nhan mat khau')
    .custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error('Mat khau khong khop')
        }
        return true;
    }),
]



Router.get('/login',UserController.main);

// router.post('/login',UserController.login_post);
// router.get('/logout',(req,res)=>{
//     req.session.destroy()
//     res.redirect('../login')
// })

// router.get('/register',UserController.register_get)
// router.post('/register',UserController.register_post)

module.exports = Router;
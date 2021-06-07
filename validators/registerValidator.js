const {check} = require('express-validator')
module.exports = [
    check('name').exists().withMessage('Vui lòng nhập tên user')
    .notEmpty().withMessage('Không được để trống tên người dùng')
    .isLength({min:6}).withMessage('Tên người dùng phải từ 6 kí tự'),

    check('email').exists().withMessage('Vui lòng nhập email')
    .notEmpty().withMessage('Không được để trống email')
    .isEmail().withMessage('Đây không phải là email hợp lệ'),

    check('password').exists().withMessage('Vui lòng nhập mật khẩu')
    .notEmpty().withMessage('Không được để trống password')
    .isLength({min:6}).withMessage('Mật khẩu phải từ 6 kí tự'),

    check('rePassword').exists().withMessage('Vui long nhap xac nhan mat khau')
    .notEmpty().withMessage('Vui long nhap xac nhan mat khau')
    .custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error('Mat khau khong khop')
        }
        return true;
    }),
]
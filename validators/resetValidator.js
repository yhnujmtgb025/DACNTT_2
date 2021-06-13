const {check} = require('express-validator')
module.exports = [
    check('password').exists().withMessage('Vui lòng nhập mật khẩu')
    .notEmpty().withMessage('Không được để trống password')
    .isLength({min:6}).withMessage('Mật khẩu phải từ 6 kí tự'),

    check('rePassword').exists().withMessage('Vui lòng nhập xác nhận mật khẩu')
    .notEmpty().withMessage('Vui lòng nhập xác nhận mật khẩu')
    .custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error('Mật khẩu không khớp')
        }
        return true;
    }),
]
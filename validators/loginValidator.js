const {check} = require('express-validator')
module.exports = [

    check('email')
    .exists().withMessage('Vui long nhap email user')
    .notEmpty().withMessage('Không được để trống email')
    .isEmail().withMessage('Đây không phải email hợp lệ'),

    check('password')
    .exists().withMessage('Vui lòng nhập mật khẩu')
    .notEmpty().withMessage('Không được để trống password')
    .isLength({min:6}).withMessage('Mật khẩu phải từ 6 kí tự'),

]
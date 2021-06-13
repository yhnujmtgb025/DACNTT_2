const {check} = require('express-validator')
module.exports = [

    check('email')
    .exists().withMessage('Vui long nhap email user')
    .notEmpty().withMessage('Không được để trống email')
    .isEmail().withMessage('Đây không phải email hợp lệ')
]
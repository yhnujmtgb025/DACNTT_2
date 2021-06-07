const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: {type: String, require: true},
    password: {type: String},
    email: {type: String},
    fullname: {type: String},
    googleId: {type: String},
    role: {type: String},
    age: {type: Number,
    validate : {
        validator : Number.isInteger,
        message   : '{VALUE} is not an integer value'
    }
    },
    country: {type: String},
    gender: {type:Boolean},
},{
    timestamps:true
})

module.exports = mongoose.model('User', UserSchema)
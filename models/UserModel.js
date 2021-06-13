const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: {type: String, require: true},
    password: {type: String},
    email: {type: String,
        required: true,
        match: /.+\@.+\..+/,
        unique: true
    },
    fullname: {type: String},
    resetLink: {type: String,default: ''},
    isVerified:{type: Boolean},
    emailToken:{type: String},
    googleId: {type: String},
    role: {type: Number,
    validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
    }},
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
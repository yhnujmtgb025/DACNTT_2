const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new Schema({
    name:{type: String,require: true},
    fullname: {type: String,require: true},
    password: {type: String},
    email: {type: String,
        required: true,
        match: /.+\@.+\..+/,
        unique: true
    },
    profileImage:{type:String},
    resetLink: {type: String,default: ''},
    isFollow:{type:Boolean,default:false},
    bio:{type:String,default: ''},
    followings:{ type : Array , default : [] },
    followers:{ type : Array , default : [] },
    role: {type: Number,
    validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
    }}
},{
    timestamps:true
})

module.exports = mongoose.model('User', UserSchema)
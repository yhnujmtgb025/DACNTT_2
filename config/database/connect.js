const mongoose = require('mongoose')

async function connect() {
    try {
        await mongoose.connect('mongodb+srv://thanhvm27:n15AL86BXRWr827X@cluster0.x33snn0.mongodb.net/?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })
        console.log('connect succesfully')
    } catch (error) {
        console.log('fail')
    }
}

module.exports = { connect }
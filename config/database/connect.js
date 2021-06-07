const mongoose = require('mongoose')

async function connect() {
    try {
        await mongoose.connect('mongodb://localhost/da_cntt2', {
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
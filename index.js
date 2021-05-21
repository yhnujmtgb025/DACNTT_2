const express = require('express')
const app = express()

app.set('view engine','ejs')
app.use(express.static('public'))

app.get('/', function (req, res) {
  res.render('home')
})
app.get('/login', function (req, res) {
    res.render('login')
  })
 
app.listen(8080,() => console.log('http://localhost:8080'))
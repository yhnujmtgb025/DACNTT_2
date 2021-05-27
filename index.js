const express = require('express')
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', function (req, res) {
  res.render('homePage/home')
})
app.get('/login', function (req, res) {
  res.render('handleLogin/login')
})
app.get('/forget', function (req, res) {
  res.render('handleLogin/forget')
})
app.get('/signup', function (req, res) {
  res.render('handleLogin/signup')
})

app.get('/listUnfollow', function (req, res) {
  res.render('homePage/listUnfollow')
})
app.get('/sendMessage', function (req, res) {
  res.render('homePage/sendMessage')
})


app.listen(8080, () => console.log('http://localhost:8080'))

var fs = require('fs')
  , join = require('path').join

var CONFPATH = join(process.env.HOME, '.swiftz')
  , USERPATH = join(CONFPATH, 'users')

var users = []

if (!fs.existsSync(CONFPATH)) {
  fs.mkdirSync(CONFPATH)
}

if (!fs.existsSync(USERPATH)) {
  fs.mkdirSync(USERPATH)
}

fs.readdirSync(USERPATH).forEach(function (filename) {
  if (filename.length > 5 && filename.substr(filename.length - 5) == '.json') {
    users.push(filename.substr(0, filename.length - 5))
  }
})

function User (username) {
  this.username = username
  this.password = undefined
  this.logs = []
}

module.exports = User

User.find = function (username) {
  var filename = join(USERPATH, username + '.json')
  if (!fs.existsSync(filename)) return null

  var file = fs.readFileSync(filename, 'utf-8')
  if (!file) return null

  var json
  try {
    json = JSON.parse(file)
  } catch (e) {
  }
  if (!json) return null

  var user = new User(username)
  user.password = json.password // TODO: decrypt
  user.logs = json.logs
  return user
}

User.list = function () {
  return users
}

User.create = function (username) {
  return new User(username)
}

User.remove = function (username) {
  if (!username) return
  var filename = join(USERPATH, username + '.json')
  if (fs.existsSync(filename)) fs.unlinkSync(filename)
}

User.prototype.save = function () {
  if (!this.username) return
  var filename = join(USERPATH, this.username + '.json')
  fs.writeFileSync(filename, JSON.stringify({
    password: this.password // TODO: encrypt
  , logs: this.logs.slice(0, 20)
  }))
  return this
}

User.prototype.log = function (message) {
  this.logs.unshift({
    time: +new Date()
  , message: message
  })
  return this
}

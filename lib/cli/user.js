
var async = require('async')
  , commander = require('commander')

var User = require('../user')
  , Swiftz = require('../swiftz')

exports.add = function (username, callback) {
  var password

  async.waterfall([
    function (next) {
      if (username) return next()
      commander.prompt('Username:', function (input) {
        username = input
        return next()
      })
    }
  , function (next) {
      if (!username) return next()
      commander.password('Password (leave empty to ask every time):', function (input) {
        password = input
        return next()
      })
    }
  ], function () {
    if (!username) return callback('canceled.')
    User.create('')
  })
}

exports.update = function (username) {

}

exports.remove = function (username) {
  User.remove(username)
}

exports.logs = function () {
  Swiftz.status(function (err, status) {
    if (status.online) {
      var user = User.find(status.username)
      if (user) {
        console.log(user.logs)
      }
    }
  })
}

exports.list = function () {
  console.log(User.list().join('\n'))
}

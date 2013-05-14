
var User = require('../user')
  , Swiftz = require('../swiftz')

exports.add = function (username) {

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

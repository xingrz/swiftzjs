
var User = require('../user')

exports.add = function (username) {

}

exports.remove = function (username) {
  User.remove(username)
}

exports.logs = function () {

}

exports.list = function () {
  console.log(User.list().join('\n'))
}

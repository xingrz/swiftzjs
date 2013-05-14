
var async = require('async')
  , commander = require('commander')
  , configCLI = require('./config')
  , config = require('../config')
  , User = require('../user')

exports.login = function (username) {
  var daemon = this.daemon
    , guest = !!this.guest
    , user

  async.waterfall([
    function (next) {
      if (username) return next()

      commander.prompt('Username: ', function (input) {
        process.stdin.pause() // work-around for #133
        username = input
        next()
      })
    }
  , function (next) {
      user = User.find(username) || User.create(username)
      if (user.password) return next()

      commander.password('Password: ', function (input) {
        process.stdin.pause() // work-around for #133
        user.password = input
        if (!guest) user.save()
        next()
      })
    }
  , configCLI.all
  ], function (err) {
    console.log('')
    console.log('')
    console.log('username', user.username)
    console.log('password', user.password)
    console.log('ip', config.ip)
    console.log('mac', config.mac)
    console.log('server', config.server)
    console.log('entry', config.entry)
    console.log('run as daemon', daemon)
    console.log('guest mode', guest)
  })
}

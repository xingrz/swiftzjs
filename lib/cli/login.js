
var async = require('async')
  , commander = require('commander')
  , configCLI = require('./config')
  , config = require('../config')
  , User = require('../user')
  , Swiftz = require('../swiftz')

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
    if (daemon) {
      Swiftz.start(function (err, swiftz) {
        if (err) {
          console.log('error: %s', err)
          return
        }

        swiftz.login(
          user.username, user.password
        , config.mac, config.ip
        , config.server, config.entry
        , function (err, result) {
            console.log(result)
            if (!guest) user.log(result.message).save()
            swiftz.unref()
          }
        )
      })
    } else {
      Swiftz.login(user.username, user.password, config.mac, config.ip, config.server, config.entry)
    }
  })
}

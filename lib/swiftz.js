var async = require('async')
  , commander = require('commander')

exports.login = function (username) {
  var server = this.server
    , entry = this.entry
    , mac = this.mac
    , ip = null//getIp() //null if changed(and more than ip) or no record
    , password = null
    , daemon = this.daemon
    , privacy = !!this.privacy

  async.waterfall([
    function (next) {
      if (ip) return next()

      var ips = ['172.16.123.1', '172.16.123.2']//getIps()
      console.log('Choose your IP address:')
      commander.choose(ips, function (i) {
        process.stdin.pause() // work-around for #133
        ip = ips[i]
        next()
      })
    }
  , function (next) {
      if (server) return next()

      // .......
      server = '172.16.1.180'
      next()
    }
  , function (next) {
      if (entry) return next()

      // .....
      var entries = ['internet', 'local']
      console.log('Choose the entry for connection:')
      commander.choose(entries, function (i) {
        process.stdin.pause() // work-around for #133
        entry = entries[i]
        next()
      })
    }
  , function (next) {
      if (username) return next()

      commander.prompt('Username: ', function (input) {
        process.stdin.pause() // work-around for #133
        username = input
        next()
      })
    }
  , function (next) {
      //if (getUsers(username).password) return next()

      commander.password('Password: ', function (input) {
        process.stdin.pause() // work-around for #133
        password = input
        next()
      })
    }
  ], function () {
    console.log('username', username)
    console.log('password', password)
    console.log('ip', ip)
    console.log('mac', mac)
    console.log('server', server)
    console.log('entry', entry)
    console.log('run as daemon', daemon)
    console.log('privacy mode', privacy)
  })
}

exports.logout = function () {

}

exports.status = function () {

}

exports.add = function (user) {
console.log(this)
}

exports.remove = function (user) {

}

exports.users = function () {

}


var spawn = require('child_process').spawn
  , path = require('path')
  , fs = require('fs')
  , NsSocket = require('nssocket').NsSocket
  , daemonCLI = require('./cli/daemon')

var CONFPATH = path.join(process.env.HOME, '.swiftz')
  , SOCKPATH = path.join(CONFPATH, 'swiftz.sock')
  , PIDPATH  = path.join(CONFPATH, 'swiftz.pid')
  , OUTPATH = path.join(CONFPATH, 'stdout.log')
  , ERRPATH = path.join(CONFPATH, 'stderr.log')
  , DAEMON  = path.resolve(__dirname, '..', 'bin', 'daemon')

var instance

function Swiftz (callback) {
  var self = this
  self.socket = new NsSocket()

  function connect () {
    self.socket.connect(SOCKPATH, function (err) {
      if (err) return callback(err)
      return callback(null, self)
    })
  }

  fs.exists(PIDPATH, function (exists) {
    if (exists) {
      connect()
    } else {
      var stdout = fs.openSync(OUTPATH, 'a')
        , stderr = fs.openSync(ERRPATH, 'a')

      var daemon = spawn(DAEMON, [], {
        stdio: ['ipc', stdout, stderr]
      , detached: true
      })

      daemon.once('exit', function (code) {
        fs.unlinkSync(PIDPATH)
        console.error('Daemon died unexpectedly with exit code %d', code)
      })

      // Once the daemon has started up, it will send a
      // message to the parent to tell that it was ready.
      // The only thing we should do is to remove all
      // references to the daemon process.
      daemon.once('message', function (message) {
        connect()           // do the following communications via UNIX socket
        daemon.disconnect() // disconnect stdin ipc
        daemon.unref()      // remove references
      })
    }
  })
}

module.exports = Swiftz

Swiftz.start = function (callback) {
  return instance
       ? callback(null, instance)
       : instance = new Swiftz(callback)
}

Swiftz.login = function (username, password, mac, ip, server, entry) {
  daemonCLI.login(username, password, mac, ip, server, entry)
}

Swiftz.status = function (callback) {
  fs.exists(PIDPATH, function (exists) {
    if (exists) {
      var socket = new NsSocket()
      socket.connect(SOCKPATH, function (err) {
        if (err) return callback(err)
        socket.once(['data', 'status'], function (data) {
          callback(null, data)
          socket.end()
        })
        socket.send(['status'])
      })
    } else {
      callback(null, false)
    }
  })
}

Swiftz.prototype.login = function (username, password, mac, ip, server, entry, callback) {
  if ('function' === typeof callback) {
    this.socket.once(['data', 'login'], function (data) {
      callback(null, data)
    })
  }

  this.socket.send(['login'], {
    username: username
  , password: password
  , mac: mac
  , ip: ip
  , server: server
  , entry: entry
  })
}

Swiftz.prototype.logout = function (callback) {
  if ('function' === typeof callback) {
    this.socket.once(['data', 'logout'], function () {
      callback()
    })
  }

  this.socket.send(['logout'])
}

Swiftz.prototype.unref = function () {
  this.socket.destroy()
}

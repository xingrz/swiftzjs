var protocol = require('./protocol')

module.exports = exports = Amtium
exports.Amtium = Amtium

Amtium.initialize = function (callback) {
  protocol.send(protocol.INITIALIZE, callback)
}

Amtium.server = function (ip, mac, callback) {
  protocol.send(protocol.SERVER, [
    { ip: ip }
  , { mac: mac }
  ], function (err, result) {
    if (err) {
      return callback(err)
    }

    callback(null, result.server)
  })
}

Amtium.entries = function (mac, callback) {
}

Amtium.online = function (username, password, entry, ip, mac, dhcp, version, onDisconnected, callback) {
}

Amtium.confirm = function (username, entry, ip, mac, callback) {
}

Amtium.breathe = function (session, ip, mac, index, callback) {
}

Amtium.offline = function (session, ip, mac, index, callback) {
}


var config = require('../config')
  , networkInterfaces = require('os').networkInterfaces
  , commander = require('commander')
  , async = require('async')

exports.all = function (callback) {
  async.waterfall([
    function (next) {
      if (config.ethernet) {
        if (config.ip) {
          if ('000000000000' != config.mac) {
            console.log('interface: %s, %s, %s', config.ethernet, config.mac, config.ip)
          } else {
            console.log('interface: %s, %s', config.ethernet, config.ip)
          }
          next()
        } else {
          exports.ip(null, next)
        }
      } else {
        exports.network(null, next)
      }
    }
  , function (next) {
      if (config.server) {
        console.log('server: %s', config.server)
        next()
      } else {
        exports.server(null, next)
      }
    }
  , function (next) {
      if (config.entry) {
        console.log('entry: %s', config.entry)
        next()
      } else {
        exports.entry(null, next)
      }
    }
  ], callback)
}

exports.network = function (name, callback) {
  if ('function' !== typeof callback) callback = function () {}

  if (name) {
    setEthernet(name, callback)
  } else {
    var interfaces = networkInterfaces()
    var ethernets = [], descriptions = []

    Object.keys(interfaces).forEach(function (intf) {
      var addresses = []
      interfaces[intf].forEach(function (address) {
        if (validAddress(address)) addresses.push(address.address)
      })

      if (addresses.length) {
        ethernets.push(intf)
        descriptions.push(intf + ': ' + addresses.join(', '))
      }
    })

    if (ethernets.length > 1) {
      console.log('Choose an network interface:')
      commander.choose(descriptions, function (i) {
        process.stdin.pause() // work-around for #133
        setEthernet(ethernets[i], callback)
      })
    } else {
      setEthernet(ethernets[0], callback)
    }
  }
}

exports.ip = function (address, callback) {
  if ('function' !== typeof callback) callback = function () {}

  if (address) {
    setIp(address, callback)
  } else {
    var addresses = []
    networkInterfaces()[config.ethernet].forEach(function (address) {
      if (validAddress(address)) addresses.push(address.address)
    })

    if (addresses.length > 1) {
      console.log('Choose an ip address to use:')
      commander.choose(addresses, function (i) {
        process.stdin.pause() // work-around for #133
        setIp(addresses[i], callback)
      })
    } else {
      setIp(addresses[0], callback)
    }
  }
}

exports.mac = function (address, callback) {
  if ('function' !== typeof callback) callback = function () {}

  if (address) {
    setMac(address, callback)
  } else {
    commander.prompt('Set the MAC address (defaults to 000000000000): ', function (address) {
      process.stdin.pause() // work-around for #133
      setMac(address, callback)
    })
  }
}

exports.server = function (address, callback) {
  if ('function' !== typeof callback) callback = function () {}

  if (address) {
    setServer(address, callback)
  } else {
    // ....
    setServer('172.16.1.180', callback)
  }
}

exports.entry = function (entry, callback) {
  if ('function' !== typeof callback) callback = function () {}

  if (entry) {
    setEntry(entry, callback)
  } else {
    // .....
    var entries = ['internet', 'local']
    console.log('Choose the entry for connection:')
    commander.choose(entries, function (i) {
      process.stdin.pause() // work-around for #133
      setEntry(entries[i], callback)
    })
  }
}

function setEthernet (value, callback) {
  config.ethernet = value
  if (config.ethernet == value) {
    if (config.ip) {
      if ('000000000000' != config.mac) {
        console.log('interface: %s, %s, %s', config.ethernet, config.mac, config.ip)
      } else {
        console.log('interface: %s, %s', config.ethernet, config.ip)
      }
      callback()
    } else {
      exports.set('ip', callback)
    }
  } else {
    console.log('error: invalid interface name')
    callback()
  }
}

function setServer (value, callback) {
  config.server = value
  if (config.server == value) {
    console.log('server: %s', config.server)
    callback()
  } else {
    console.log('error: invalid server address')
    callback()
  }
}

function setEntry (value, callback) {
  config.entry = value
  if (config.entry == value) {
    console.log('entry: %s', config.entry)
    callback()
  } else {
    console.log('error: invalid entry')
    callback()
  }
}

function setIp (value, callback) {
  config.ip = value
  if (config.ip == value) {
    if ('000000000000' != config.mac) {
      console.log('interface: %s, %s, %s', config.ethernet, config.mac, config.ip)
    } else {
      console.log('interface: %s, %s', config.ethernet, config.ip)
    }
    callback()
  } else {
    console.log('error: invalid ip address')
    callback()
  }
}

function setMac (value, callback) {
  config.mac = value
  if (!value || config.mac == value) {
    if ('000000000000' != config.mac) {
      console.log('interface: %s, %s, %s', config.ethernet, config.mac, config.ip)
    } else {
      console.log('interface: %s, %s', config.ethernet, config.ip)
    }
    callback()
  } else {
    console.log('error: invalid mac address')
    callback()
  }
}

function validAddress (address) {
  return address.address
      && '127.0.0.1' != address.address
      && '0.0.0.0' != address.address
      && 'IPv4' == address.family
}

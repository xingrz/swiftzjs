
var config = require('../config')

var networkInterfaces = require('os').networkInterfaces

exports.network = function (intf, ip, setterIntf, setterIp, callback) {
  if ('function' !== typeof callback) callback = function () {}

  var self = this

  var interfaces = networkInterfaces()
  var ethernets = {}

  Object.keys(interfaces).forEach(function (item) {
    var addresses = []
    interfaces[item].forEach(function (address) {
      if (validAddress(address)) addresses.push(address.address)
    })

    if (addresses.length) {
      ethernets[item] = addresses
    }
  })

  var keys = Object.keys(ethernets)
  switch (keys.length) {
    case 0:
      return callback('no network interface avaliable')
    case 1:
      config.ethernet = ethernets[keys[0]]
      return callback(null, config.ethernet, config.mac, config.ip)
  }

  function setInterface (value) {
    config.ethernet = value
    if (config.ethernet == value) {
      if (config.ip) {
        done()
      } else {
        setterIp(ethernets[value], setIp)
      }
    } else {
      callback('invalid interface name')
    }
  }

  function setIp (value) {
    config.ip = value
    if (config.ip == value) {
      done()
    } else {
      callback('invalid ip address')
    }
  }

  function done () {
    callback(null, config.ethernet, config.mac, config.ip)
  }

  if (intf && ethernets[intf]) {
    setInterface(intf)
  } else {
    if (config.ethernet) {
      setInterface(config.ethernet)
    } else {
      setterIntf(ethernets, setInterface)
    }
  }
}

exports.mac = function (address, setter, callback) {
  if ('function' !== typeof callback) callback = function () {}

  function setValue (value) {
    config.mac = value
    if (!value || config.mac == value) {
      callback(null, config.ethernet, config.mac, config.ip)
    } else {
      callback('invalid mac address')
    }
  }

  if (address) {
    setValue(address)
  } else {
    setter(setValue)
  }
}

exports.server = function (address, callback) {
  if ('function' !== typeof callback) callback = function () {}

  function setValue (value) {
    config.server = value
    if (config.server == value) {
      callback(null, config.server)
    } else {
      callback('invalid server address')
    }
  }

  if (address) {
    setValue(address)
  } else {
    // ........
    setValue('172.16.1.180')
  }
}

exports.entry = function (entry, setter, callback) {
  if ('function' !== typeof callback) callback = function () {}

  function setValue (value) {
    config.entry = value
    if (config.entry == value) {
      callback(null, config.entry)
    } else {
      callback('invalid entry')
    }
  }

  if (entry) {
    setValue(entry)
  } else {
    if (config.entry) {
      setValue(config.entry)
    } else {
      var entries = ['internet', 'local']
      setter(entries, setValue)
    }
  }
}

function validAddress (address) {
  return address.address
      && '127.0.0.1' != address.address
      && '0.0.0.0' != address.address
      && 'IPv4' == address.family
}

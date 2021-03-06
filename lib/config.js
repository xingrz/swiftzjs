
var join = require('path').join
  , fs = require('fs')
  , async = require('async')
  , networkInterfaces = require('os').networkInterfaces
  , isIPv4 = require('net').isIPv4

var CONFPATH = join(process.env.HOME, '.swiftz')
var ethernet, entry, server, ip, mac

exports.__defineGetter__('ethernet', function () {
  return ethernet
})

exports.__defineGetter__('entry', function () {
  return entry
})

exports.__defineGetter__('server', function () {
  return server
})

exports.__defineGetter__('ip', function () {
  return ip
})

exports.__defineGetter__('mac', function () {
  return mac
})

exports.__defineSetter__('ethernet', function (value) {
  if (!value) {
    ethernet = undefined
    ip = undefined
  } else {
    var interfaces = networkInterfaces()

    if (!interfaces[value]) return

    ethernet = value

    var addresses = []
    interfaces[ethernet].forEach(function (address) {
      if (validAddress(address)) addresses.push(address.address)
    })

    ip = (1 == addresses.length)
       ? addresses[0]
       : undefined
  }

  writeConf()
})

exports.__defineSetter__('entry', function (value) {
  entry = value || undefined
  writeConf()
})

exports.__defineSetter__('server', function (value) {
  if (!value) {
    server = undefined
  } else {
    if (!isIPv4(value)) return
    server = value
  }

  writeConf()
})

exports.__defineSetter__('ip', function (value) {
  if (!value) {
    ip = undefined
  } else {
    var interfaces = networkInterfaces()

    if (!ethernet) return
    if (!interfaces[ethernet]) return

    if (!interfaces[ethernet].some(function (address) {
      return value == address.address && validAddress(address)
    })) return

    ip = value
  }

  writeConf()
})

exports.__defineSetter__('mac', function (value) {
  if (!value) {
    mac = '000000000000'
  } else {
    if (!/^[0-9A-Fa-f]{12}$/.test(value)) return
    mac = value
  }

  writeConf()
})

function writeConf () {
  var CONF = join(CONFPATH, 'conf')
  fs.writeFileSync(CONF, JSON.stringify({
    ethernet: ethernet
  , entry: entry
  , server: server
  , ip: ip
  , mac: mac
  }))
}

function readConf () {
  var CONF = join(CONFPATH, 'conf')
  if (fs.existsSync(CONF)) {
    var file = fs.readFileSync(CONF, 'utf-8')
    if (!file) return

    var json
    try {
      json = JSON.parse(file)
    } catch (e) {
      writeConf()
    }
    if (!json) return

    var interfaces = networkInterfaces()


    if (json.ethernet && interfaces[json.ethernet]) {
      ethernet = json.ethernet
    }

    if (json.entry) {
      entry = json.entry
    }

    if (json.server && isIPv4) {
      server = json.server
    }

    if (json.ip && ethernet) {
      var addresses = []
      interfaces[ethernet].forEach(function (address) {
        if (validAddress(address)) addresses.push(address.address)
      })

      if (-1 == addresses.indexOf(json.ip)) {
        if (1 == addresses.length) ip = addresses[0]
      } else {
        ip = json.ip
      }
    }

    if (json.mac) {
      mac = json.mac
    } else {
      mac = '000000000000'
    }
  }

  writeConf()
}

if (fs.existsSync(CONFPATH)) {
  readConf()
} else {
  fs.mkdirSync(CONFPATH)
}

function validAddress (address) {
  return address.address
      && '127.0.0.1' != address.address
      && '0.0.0.0' != address.address
      && 'IPv4' == address.family
}

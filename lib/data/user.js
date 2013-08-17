var fs = require('fs')
  , join = require('path').join

var async = require('async')

var ROOT = join(process.env.HOME, '.swiftz')
  , USER = join(ROOT, 'users')

exports.list = function (callback) {
  async.waterfall([
    prepare
  , fs.readdir.bind(fs, USER)
  ], callback)
}

exports.add = function (name, password, callback) {
  var HOME = join(USER, name)

  async.waterfall([
    prepare
  , fs.mkdir.bind(fs, HOME)
  , fs.writeFile.bind(fs, join(HOME, 'passwd'), 'encrypted password')
  ], callback)
}

exports.remove = function (name, callback) {
  var HOME = join(USER, name)

  async.waterfall([
    fs.readdir.bind(fs, HOME)
  , function (files, next) {
      async.each(files, function (file, done) {
        fs.unlink(join(HOME, file), done)
      }, next)
    }
  , fs.rmdir.bind(fs, HOME)
  ], callback)
}

exports.get = function (name, callback) {

}

exports.update = function (name, password, callback) {

}

function prepare (callback) {
  async.waterfall([
    safeMkdir.bind(this, ROOT)
  , safeMkdir.bind(this, USER)
  ], callback)
}

function safeMkdir (path, callback) {
  fs.exists(path, function (exists) {
    if (exists) {
      return callback()
    }

    fs.mkdir(path, callback)
  })
}

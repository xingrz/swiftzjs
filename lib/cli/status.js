
var Swiftz = require('../swiftz')

exports.status = function () {
  Swiftz.status(function (err, status) {
    console.log(status)
  })
}


var udp = require('dgram')
  , anzio = require('./lib/anzio')

var app = anzio()

app.use(anzio.crypto())
app.

udp.createSocket('udp4', app).bind(3848)

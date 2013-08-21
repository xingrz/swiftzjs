
var http = require('http')
  , tcp = require('net')
  , parse = require('url').parse

var server = http.createServer()

server.on('request', function (incoming, response) {
  var options = parse(incoming.url)
  options.headers = incoming.headers
  options.method = incoming.method

  if (options.headers['proxy-connection']) {
    delete options.headers['proxy-connection']
    options.headers['connection'] = 'close'
  }

  var request = http.request(options, function (proxying) {
    response.writeHead(proxying.statusCode, proxying.headers)
    proxying.pipe(response)

    var incomingLeading = [
      options.method
    , options.path
    , 'HTTP/' + incoming.httpVersion
    ].join(' ')

    var proxyingLeading = [
      'HTTP/' + proxying.httpVersion
    , proxying.statusCode
    , http.STATUS_CODES[proxying.statusCode]
    ].join(' ')

    console.log('---------------------------------')
    console.log('')
    console.log(inspect(options.headers, incomingLeading))
    console.log('')
    console.log(inspect(proxying.headers, proxyingLeading))
    console.log('')
  })

  incoming.pipe(request)
})

server.on('connect', function (incoming, response, head) {
  var url = incoming.url.split(':')

  var proxying = tcp.connect(url[1], url[0], function () {

    var proxyingLeading = 'HTTP/1.1 200 Connection Established'

    var incomingLeading = [
      'CONNECT'
    , incoming.url
    , 'HTTP/' + incoming.httpVersion
    ].join(' ')

    proxying.write(head)

    response.write(proxyingLeading + '\r\n')
    response.write('proxy-agent: Node-Proxy\r\n')
    response.write('\r\n')

    proxying.pipe(response)
    response.pipe(proxying)

    console.log('---------------------------------')
    console.log('')
    console.log(inspect(incoming.headers, incomingLeading))
    console.log('')
    console.log(inspect({
      'proxy-agent': 'Node'
    , 'connection': 'close'
    }, proxyingLeading))
    console.log('')
  })
})

/*server.on('upgrade', function (incoming, socket, head) {
})*/

server.listen(8000)

function inspect (headers, leading) {
  var colors = require('colors')

  var keys = Object.keys(headers)

  var longest = 30

  keys.forEach(function (key) {
    if (key.length > longest) longest = key.length
  })

  var result = keys.map(function (key) {
    if (Array.isArray(headers[key])) {
      headers[key] = headers[key].join('\r\n' + space(longest + 4))
    }

    return (space(longest - key.length + 2) + key + ': ').grey + headers[key].green
  })

  if (leading) {
    var split = leading.split(' ')
    if ('HTTP/' == split[0].slice(0, 5)) {
      result.unshift('  '
      + split[0].cyan + ' '
      + split[1].magenta + ' '
      + split.slice(2).join(' ').red
      )
    }
    else {
      result.unshift('  '
      + split[0].red + ' '
      + split.slice(1, -1).join(' ').white + ' '
      + split.slice(-1)[0].cyan
      )
    }
  }

  return result.join('\n')
}

function space (times) {
  var spaces = ''
  for (; times--;) spaces += ' '
  return spaces
}

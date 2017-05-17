var net = require('net')
var Socket = net.Socket
var async = require('async')
var isNumberLike = require('is-number-like')
var promisify = require('./promisify')

/**
 * Finds the first port with a status of 'open', implying the port is in use and
 * there is likely a service listening on it.
 */
/**
 * @param {Number} startPort - Port to begin status check on (inclusive).
 * @param {Number} [endPort=65535] - Last port to check status on (inclusive).
 * @param {String} [host='127.0.0.1'] - Host of where to scan.
 * @param {findPortCallback} [callback] - Function to call back with error or results.
 * @returns {Promise}
 * @example
 * // scans through 3000 to 3002 (inclusive)
 * portscanner.findAPortInUse(3000, 3002, '127.0.0.1', console.log)
 * // returns a promise in the absence of a callback
 * portscanner.findAPortInUse(3000, 3002, '127.0.0.1').then(console.log)
 * @example
 * // scans through 3000 to 65535 on '127.0.0.1'
 * portscanner.findAPortInUse(3000, console.log)
 */
/**
 * @param {Array} postList - Array of ports to check status on.
 * @param {String} [host='127.0.0.1'] - Host of where to scan.
 * @param {findPortCallback} [callback] - Function to call back with error or results.
 * @returns {Promise}
 * @example
 * // scans 3000 and 3002 only, not 3001.
 * portscanner.findAPortInUse([3000, 3002], console.log)
 */
function findAPortInUse () {
  var params = [].slice.call(arguments)
  params.unshift('open')
  return findAPortWithStatus.apply(null, params)
}

/**
 * Finds the first port with a status of 'closed', implying the port is not in
 * use. Accepts identical parameters as {@link findAPortInUse}
 */
function findAPortNotInUse () {
  var params = [].slice.call(arguments)
  params.unshift('closed')
  return findAPortWithStatus.apply(null, params)
}

/**
 * Checks the status of an individual port.
 */
/**
 * @param {Number} port - Port to check status on.
 * @param {String} [host='127.0.0.1'] - Host of where to scan.
 * @param {checkPortCallback} [callback] - Function to call back with error or results.
 * @returns {Promise}
 */
/**
 * @param {Number} port - Port to check status on.
 * @param {Object} [opts={}] - Options object.
 * @param {String} [opts.host='127.0.0.1'] - Host of where to scan.
 * @param {Number} [opts.timeout=400] - Connection timeout in ms.
 * @param {checkPortCallback} [callback] - Function to call back with error or results.
 * @returns {Promise}
 */
function checkPortStatus (port) {
  var args, host, opts, callback

  args = [].slice.call(arguments, 1)

  if (typeof args[0] === 'string') {
    host = args[0]
  } else if (typeof args[0] === 'object') {
    opts = args[0]
  } else if (typeof args[0] === 'function') {
    callback = args[0]
  }

  if (typeof args[1] === 'object') {
    opts = args[1]
  } else if (typeof args[1] === 'function') {
    callback = args[1]
  }

  if (typeof args[2] === 'function') {
    callback = args[2]
  }

  if (!callback) return promisify(checkPortStatus, arguments)

  opts = opts || {}

  host = host || opts.host || '127.0.0.1'

  var timeout = opts.timeout || 400
  var connectionRefused = false

  var socket = new Socket()
  var status = null
  var error = null

  // Socket connection established, port is open
  socket.on('connect', function () {
    status = 'open'
    socket.destroy()
  })

  // If no response, assume port is not listening
  socket.setTimeout(timeout)
  socket.on('timeout', function () {
    status = 'closed'
    error = new Error('Timeout (' + timeout + 'ms) occurred waiting for ' + host + ':' + port + ' to be available')
    socket.destroy()
  })

  // Assuming the port is not open if an error. May need to refine based on
  // exception
  socket.on('error', function (exception) {
    if (exception.code !== 'ECONNREFUSED') {
      error = exception
    } else {
      connectionRefused = true
    }
    status = 'closed'
  })

  // Return after the socket has closed
  socket.on('close', function (exception) {
    if (exception && !connectionRefused) { error = error || exception } else { error = null }
    callback(error, status)
  })

  socket.connect(port, host)
}
/**
 * Callback for {@link checkPortStatus}
 * @callback checkPortCallback
 * @param {Error|null} error - Any error that occurred while port scanning, or null.
 * @param {String} status - Status: 'open' if the port is in use, 'closed' if the port is available.
 */

/**
 * Internal helper function used by {@link findAPortInUse} and {@link findAPortNotInUse}
 * to find a port from a range or a list with a specific status.
 */
/**
 * @param {String} status - Status to check.
 * @param {...params} params - Params as passed exactly to {@link findAPortInUse} and {@link findAPortNotInUse}.
 */
function findAPortWithStatus (status) {
  var params, startPort, endPort, portList, host, callback

  params = [].slice.call(arguments, 1)

  if (params[0] instanceof Array) {
    portList = params[0]
  } else if (isNumberLike(params[0])) {
    startPort = parseInt(params[0], 10)
  }

  if (typeof params[1] === 'function') {
    callback = params[1]
  } else if (typeof params[1] === 'string') {
    host = params[1]
  } else if (isNumberLike(params[1])) {
    endPort = parseInt(params[1], 10)
  }

  if (typeof params[2] === 'string') {
    host = params[2]
  } else if (typeof params[2] === 'function') {
    callback = params[2]
  }

  if (typeof params[3] === 'function') {
    callback = params[3]
  }

  if (!callback) return promisify(findAPortWithStatus, arguments)

  if (startPort && endPort && endPort < startPort) {
    // WARNING: endPort less than startPort. Using endPort as startPort & vice versa.
    var tempStartPort = startPort
    startPort = endPort
    endPort = tempStartPort
  }

  endPort = endPort || 65535

  var foundPort = false
  var numberOfPortsChecked = 0
  var port = portList ? portList[0] : startPort

  // Returns true if a port with matching status has been found or if checked
  // the entire range of ports
  var hasFoundPort = function () {
    return foundPort || numberOfPortsChecked === (portList ? portList.length : endPort - startPort + 1)
  }

  // Checks the status of the port
  var checkNextPort = function (callback) {
    checkPortStatus(port, host, function (error, statusOfPort) {
      numberOfPortsChecked++
      if (statusOfPort === status) {
        foundPort = true
        callback(error)
      } else {
        port = portList ? portList[numberOfPortsChecked] : port + 1
        callback(null)
      }
    })
  }

  // Check the status of each port until one with a matching status has been
  // found or the range of ports has been exhausted
  async.until(hasFoundPort, checkNextPort, function (error) {
    if (error) {
      callback(error, port)
    } else if (foundPort) {
      callback(null, port)
    } else {
      callback(null, false)
    }
  })
}
/**
 * Callback for {@link findAPortWithStatus}, and by that extension, for {@link findAPortInUse} and {@link findAPortNotInUse}.
 * @callback findPortCallback
 * @param {Error|null} error - Any error that occurred while port scanning, or null.
 * @param {Number|Boolean} port - The first open port found. Note, this is the first port that returns status as 'open', not necessarily the first open port checked. If no open port is found, the value is false.
 */

/**
 * @exports portscanner
 */

module.exports = {
  findAPortInUse: findAPortInUse,
  findAPortNotInUse: findAPortNotInUse,
  checkPortStatus: checkPortStatus
}

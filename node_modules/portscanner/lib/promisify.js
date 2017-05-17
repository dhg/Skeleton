module.exports = promisify

function promisify (fn, args) {
  if (typeof Promise === 'undefined') {
    throw new Error('Please run in a Promise supported environment or provide a callback')
  }
  return new Promise(function (resolve, reject) {
    args = [].slice.call(args).concat([callback])
    fn.apply(null, args)

    function callback (error, port) {
      if (error || port === false) {
        reject(error || new Error('No open port found'))
      } else {
        resolve(port)
      }
    }
  })
}

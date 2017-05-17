var net = require('net');
var assert = require('assert');
var enableDestroy = require('./index.js');

var server = net.createServer(function(conn) {
  var i = setInterval(function() {
    conn.read();
    conn.write('hi\n');
  }, 100);
  i.unref();
});
server.listen(1337);
enableDestroy(server);

var connected = 0;
for (var i = 0; i < 10; i++) {
  var client = net.connect(1337);
  client.on('connect', function() {
    connected++;
    if (connected === 10) setTimeout(destroy);
  });

  // just ignore the resets
  client.on('error', function() {});
}

function destroy() {
  server.destroy(function() {
    console.log('ok');
  });
}

var popsicle_1 = require('popsicle');
var url_1 = require('url');
var test = require('blue-tape');
var serverAddress = require('server-address');
var proxy = require('./index');
test('popsicle proxy', function (t) {
    var server;
    var proxyServer;
    t.test('before', function (t) {
        proxyServer = serverAddress(function (req, res) {
            res.end('proxy ' + req.url);
        });
        server = serverAddress(function (req, res) {
            res.end('server ' + req.url);
        });
        server.listen();
        proxyServer.listen();
        t.end();
    });
    t.test('use proxy option', function (t) {
        return popsicle_1.request(server.url())
            .use(proxy({ proxy: proxyServer.url() }))
            .then(function (res) {
            t.equal(res.status, 200);
            t.equal(res.body, 'proxy ' + server.url());
        });
    });
    t.test('support no proxy', function (t) {
        return popsicle_1.request(server.url())
            .use(proxy({ proxy: proxyServer.url(), noProxy: url_1.parse(server.url()).hostname }))
            .then(function (res) {
            t.equal(res.status, 200);
            t.equal(res.body, 'server /');
        });
    });
    t.test('after', function (t) {
        server.close();
        proxyServer.close();
        t.end();
    });
});
//# sourceMappingURL=index.spec.js.map
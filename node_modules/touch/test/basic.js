var fs = require("fs")
var touch = require("../touch.js")
var t = require('tap')

function _ (fn) { return function (er) {
  if (er) throw er
  fn()
}}

var files = [
  'sync',
  'sync-ref',
  'async',
  'async-ref'
]

files.forEach(function (f) {
  try { fs.unlinkSync(f) } catch (e) {}
})

var now = Math.floor(Date.now() / 1000) * 1000
var then = now - 1000000000 // now - 1Msec

t.test('set both to now', function (t) {
  touch.sync("sync")
  touch("async", _(function () {
    var astat = fs.statSync("async")
    var sstat = fs.statSync("sync")
    var asa = astat.atime.getTime()
    var ssa = sstat.atime.getTime()
    var asm = astat.mtime.getTime()
    var ssm = sstat.mtime.getTime()

    t.equal(asm, asa)
    t.equal(ssm, ssa)
    t.equal(ssa, now)
    t.equal(asa, now)

    // ctime should always be now-ish
    t.ok(Math.abs(Date.now() - sstat.ctime.getTime()) < 1000)
    t.ok(Math.abs(Date.now() - astat.ctime.getTime()) < 1000)
    t.end()
  }))
})

t.test('set both to now, using futimes', function (t) {
  function runTest (closeAfter) {
    t.test('closeAfter=' + closeAfter, function (t) {
      var sfd = fs.openSync('sync', 'w')

      if (closeAfter) {
        touch.ftouchSync(sfd, { closeAfter: true })
      } else {
        touch.ftouchSync(sfd)
        fs.closeSync(sfd)
      }

      var afd = fs.openSync('async', 'w')
      t.equal(afd, sfd)

      var then = _(function () {
        if (!closeAfter) {
          fs.closeSync(afd)
        }

        var astat = fs.statSync("async")
        var sstat = fs.statSync("sync")
        var asa = astat.atime.getTime()
        var ssa = sstat.atime.getTime()
        var asm = astat.mtime.getTime()
        var ssm = sstat.mtime.getTime()

        t.equal(asm, asa)
        t.equal(ssm, ssa)
        t.equal(ssa, now)
        t.equal(asa, now)

        // ctime should always be now-ish
        t.ok(Math.abs(Date.now() - sstat.ctime.getTime()) < 1000)
        t.ok(Math.abs(Date.now() - astat.ctime.getTime()) < 1000)
        t.end()
      })

      if (closeAfter) {
        touch.ftouch(afd, {closeAfter: true}, then)
      } else {
        touch.ftouch(afd, then)
      }
    })
  }

  runTest(true)
  runTest(false)
  t.end()
})

t.test('set both to now - 1Msec', function (t) {
  // also use force, just for funsies
  touch.sync("sync", { time: then, force: true })
  touch("async", { time: then, force: true }, _(function () {
    var astat = fs.statSync("async")
    var sstat = fs.statSync("sync")
    var asa = astat.atime.getTime()
    var ssa = sstat.atime.getTime()
    var asm = astat.mtime.getTime()
    var ssm = sstat.mtime.getTime()

    t.notEqual(asm, now)
    t.equal(asa, asm)

    t.notEqual(ssm, now)
    t.equal(ssa, ssm)

    t.equal(ssa, then)
    t.equal(asa, then)

    t.ok(Math.abs(Date.now() - sstat.ctime.getTime()) < 1000)
    t.ok(Math.abs(Date.now() - astat.ctime.getTime()) < 1000)
    t.end()
  }))
})

t.test('set mtime to now', function (t) {
  touch.sync("sync", { time: now, mtime: true })
  touch("async", { time: now, mtime: true }, _(function () {
    var astat = fs.statSync("async")
    var sstat = fs.statSync("sync")
    var asa = astat.atime.getTime()
    var ssa = sstat.atime.getTime()
    var asm = astat.mtime.getTime()
    var ssm = sstat.mtime.getTime()

    t.notEqual(asa, asm)
    t.notEqual(ssa, ssm)

    t.equal(ssa, then)
    t.equal(asa, then)

    t.equal(ssm, now)
    t.equal(asm, now)

    t.ok(Math.abs(Date.now() - sstat.ctime.getTime()) < 1000)
    t.ok(Math.abs(Date.now() - astat.ctime.getTime()) < 1000)
    t.end()
  }))
})

t.test('set atime to now', function (t) {
  touch.sync("sync", { time: now, atime: true })
  touch("async", { time: now, atime: true }, _(function () {
    var astat = fs.statSync("async")
    var sstat = fs.statSync("sync")
    var asa = astat.atime.getTime()
    var ssa = sstat.atime.getTime()
    var asm = astat.mtime.getTime()
    var ssm = sstat.mtime.getTime()

    t.equal(asm, now)
    t.equal(ssm, now)

    t.equal(asa, now)
    t.equal(ssa, now)

    t.ok(Math.abs(Date.now() - sstat.ctime.getTime()) < 1000)
    t.ok(Math.abs(Date.now() - astat.ctime.getTime()) < 1000)
    t.end()
  }))
})

t.test('nocreate should throw on ENOENT', function (t) {
  t.throws(function () {
    touch.sync('sync-noent', { nocreate: true })
  })
  touch('async-noent', { nocreate: true }, function (er) {
    t.isa(er, Error)
    t.end()
  })
})

t.test('use one file as ref for another', function (t) {
  touch.sync('sync-ref', { ref: 'sync' })
  touch('async-ref', { ref: 'async' }, _(function () {
    var astat = fs.statSync("async")
    var sstat = fs.statSync("sync")
    var arstat = fs.statSync('async-ref')
    var srstat = fs.statSync('sync-ref')

    var asa = astat.atime.getTime()
    var ssa = sstat.atime.getTime()
    var arsa = arstat.atime.getTime()
    var srsa = srstat.atime.getTime()

    var asm = astat.mtime.getTime()
    var ssm = sstat.mtime.getTime()
    var arsm = arstat.mtime.getTime()
    var srsm = srstat.mtime.getTime()

    var arsc = arstat.ctime.getTime()
    var srsc = srstat.ctime.getTime()

    t.equal(asm, arsm)
    t.equal(ssm, srsm)

    t.equal(asa, arsa)
    t.equal(ssa, srsa)

    t.ok(Math.abs(Date.now() - srsc) < 1000)
    t.ok(Math.abs(Date.now() - arsc) < 1000)
    t.end()
  }))
})


t.test('cleanup', function (t) {
  files.forEach(function (f) {
    t.doesNotThrow('rm ' + f, function () {
      fs.unlinkSync(f)
    })
  })
  t.end()
})

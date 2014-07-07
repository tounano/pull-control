var pull = require("pull-stream");
var balance = require("pull-balance");

var serial = module.exports.serial = pull.Through(function (read) {
  var reading, reads = [];

  return function (end, cb) {
    reads.push([end, cb]);

    if (reading) return;

    ;(function drain () {
      if (reads.length && !reading)
        (function (end, cb) {
          reading = true;
          read(end, function (end, data) {
            reading = false;
            cb(end, data);
            drain();
          })
        })(reads[0][0], reads.shift()[1]);
    })();
  }
})

var parallel = module.exports.parallel = pull.Through(function (read, highWaterMark) {
  var ended, streams = [];

  function _read(end, cb) {
    if (ended) return cb(ended);
    read(end,  function (end, data) {
      if (end) {
        streams = [];
        ended = true;
      }
      cb(end, data);
    })
  }

  for (var i = 0; i < highWaterMark; ++i)
    streams[i] = hwm(1);

  return balance(streams)(_read);
})

var hwm = pull.Through(function (read, highWaterMark) {
    var buffer = [], waiting = [], ended, ending, reading = false
    highWaterMark = highWaterMark || 10

    function readAhead () {
      while(waiting.length && (buffer.length || ended))
        waiting.shift()(ended, ended ? null : buffer.shift())

      if (!buffer.length && ending) ended = true;
    }

    function next () {
      if(ended || ending || reading || buffer.length >= highWaterMark)
        return readAhead();
      reading = true
      return read(ended, function (end, data) {
        reading = false
        ending = ending || end
        if(data != null) buffer.push(data)

        readAhead(); next();
      })
    }

    process.nextTick(next)

    return function (end, cb) {
      ended = ended || end
      waiting.push(cb)

      next(); readAhead()
    }
  })
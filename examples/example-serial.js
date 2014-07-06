var pull = require("pull-stream");
var control = require("../");

var delayedMap = function(d, done) {
  setTimeout( function () {
    done (null, d);
  }, 1000)
}

pull(
  pull.count(22),
  pull.asyncMap(delayedMap),
  control.serial(),
  control.parallel(4),
  pull.log()
)
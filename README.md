# pull-control

Control flow for pull streams.

An alternative for [pull-flow](https://github.com/dominictarr/pull-flow)

## Usage

### control.parallel(highWaterMark)

Read source in parallel. Most of the times it won't be a good idea to read sources in parallel, however it might be
 useful when you use [pull-balance](https://github.com/tounano/pull-balance), [pull-robin](https://github.com/tounano/pull-robin),
 [pull-substream](https://github.com/tounano/pull-substream) or any other source that composes several sources.

#### Example

```js
var pull = require("pull-stream");
var control = require("pull-control");

var delayedMap = function(d, done) {
  setTimeout( function () {
    done (null, d);
  }, 1000)
}

pull(
  pull.count(22),
  pull.asyncMap(delayedMap),
  control.parallel(4),
  pull.log()
)
```


### control.serial()

Restricts reading in a series. Basically, it might block any attempt of reading multiple times from the same source.
It can block `control.parallel()`;

#### Example

```js
var pull = require("pull-stream");
var control = require("pull-control");

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
```

## install

With [npm](https://npmjs.org) do:

```
npm install pull-control
```

## license

MIT
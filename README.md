# FS Wishlist
[![npm](https://img.shields.io/npm/v/fs-wishlist.svg)](https://www.npmjs.com/package/node-fs-wishlist)
[![npm](https://img.shields.io/npm/dm/fs-wishlist.svg)](https://www.npmjs.com/package/fs-wishlist)
[![Build Status](https://travis-ci.org/DavidTPate/node-fs-wishlist.svg?branch=master)](https://travis-ci.org/DavidTPate/node-fs-wishlist)
[![Coverage Status](https://coveralls.io/repos/github/DavidTPate/node-fs-wishlist/badge.svg)](https://coveralls.io/github/DavidTPate/node-fs-wishlist)

Mixins for the Node.JS [file system](https://nodejs.org/api/fs.html) adding the functionality we wish it had.

## Usage

### mixin(fs, [options])
Mixin an implementation of the [file system](https://nodejs.org/api/fs.html) interface.

#### Options
* mixins `Object` _Optional_ enables/disables mixins
  * mkdirp `Boolean` _Optional_ _Default_: `true` Controls whether [fs.mkdirp(path[, callback])](#fsmkdirppath-callback)) is mixed in.
  * rmdirp `Boolean` _Optional_ _Default_: `true` Controls whether [fs.rmdirp(path[, callback])](#fsrmdirppath-callback)) is mixed in.
  * readdirp `Boolean` _Optional_ _Default_: `true` Controls whether [fs.readdirp(path[, callback])](#fsreaddirppath-callback)) is mixed in.
  * copyDir `Boolean` _Optional_ _Default_: `true` Controls whether [fs.copyDir(sourcePath, destinationPath[, callback])](#fscopydirsourcepath-destinationpath-callback)) is mixed in.

```js
var fsWishlist = require('fs-wishlist');
var fs = require('fs');
var xfs = fsWishlist.mixin(fs);

xfs.mkdirp('test/subdirectory/a').then(function() {
  // Test directories created recursively
}, function(reason) {
  // Something went wrong
});
```

### replace([options])
Replace the `fs` module with an already mixed in vesion of `fs`.

#### Options
* mixins `Object` _Optional_ enables/disables mixins
  * mkdirp `Boolean` _Optional_ _Default_: `true` Controls whether [fs.mkdirp(path[, callback])](#fsmkdirppath-callback)) is mixed in.
  * rmdirp `Boolean` _Optional_ _Default_: `true` Controls whether [fs.rmdirp(path[, callback])](#fsrmdirppath-callback)) is mixed in.
  * readdirp `Boolean` _Optional_ _Default_: `true` Controls whether [fs.readdirp(path[, callback])](#fsreaddirppath-callback)) is mixed in.
  * copyDir `Boolean` _Optional_ _Default_: `true` Controls whether [fs.copyDir(sourcePath, destinationPath[, callback])](#fscopydirsourcepath-destinationpath-callback)) is mixed in.

```js
require('fs-wishlist').replace();

var fs = require('fs');
fs.readdirp('test').then(function(files) {
  // Files contains all files in the `test` directory
}, function(reason) {
  // Something went wrong
});
```

## Mixins
For all methods callbacks are optional, if provided they will be used otherwise a promise will be returned.

### fs.mkdirp(path[, mode][, callback])
Recursively create directories if they don't exist.

```js
var xfs = require('fs-wishlist').replace();

xfs.mkdirp('/one/two/three').then(function() {
  // Directories created
}, function(reason) {
  // Something went wrong!
});
```

### fs.rmdirp(path[, callback])
Recursively removes the given directory.

```js
var xfs = require('fs-wishlist').replace();

xfs.rmdirp('/one').then(function() {
  // All directories and files removed from `/one` and below
}, function(reason) {
  // Something went wrong!
});
```

### fs.readdirp(path[, callback])
Recursively reads the given directory.

```js
var xfs = require('fs-wishlist').replace();

xfs.readdirp('/one').then(function(files) {
  // `files` contains a list of all files and directories in `/one` recursively
}, function(reason) {
  // Something went wrong!
});
```

### fs.copyDir(sourcePath, destinationPath[, callback])
Recursively copies the contents of a directory to the destination, creates the destination directories if they do not exist.
This overwrites the files if they already exist, and directories themselves are not copied but instead a new directory is created of the same name.

```js
var xfs = require('fs-wishlist').replace();

xfs.copyDir('/one', '/two').then(function() {
  // All of the same directories created in the destination and the files are copied recursively
}, function(reason) {
  // Something went wrong!
});
```

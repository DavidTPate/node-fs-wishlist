# FS Wishlist
Mixins for the Node.JS [file system](https://nodejs.org/api/fs.html) adding the functionality we wish it had.

## Usage

### mixin(fs, [options])
Mixin an implementation of the [file system](https://nodejs.org/api/fs.html) interface.

#### Options
* mixins `Object` _Optional_ enables/disables mixins
  * mkdirp `Boolean` _Optional_ _Default_: `true` Controls whether [fs.mkdirp(path, [callback])](#fsmkdirppath-callback)) is mixed in.
  * rmdirp `Boolean` _Optional_ _Default_: `true` Controls whether [fs.rmdirp(path, [callback])](#fsrmdirppath-callback)) is mixed in.
  * readdirp `Boolean` _Optional_ _Default_: `true` Controls whether [fs.readdirp(path, [callback])](#fsreaddirppath-callback)) is mixed in.
  * copyFile `Boolean` _Optional_ _Default_: `true` Controls whether [fs.copyFile(sourcePath, destinationPath, [callback])](#fscopyFilesourcePath-destinationPath-callback)) is mixed in.
  * copyDir `Boolean` _Optional_ _Default_: `true` Controls whether [fs.copyDir(sourcePath, destinationPath, [callback])](#fscopyDirsourcePath-destinationPath-callback)) is mixed in.

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
  * mkdirp `Boolean` _Optional_ _Default_: `true` Controls whether [fs.mkdirp(path, [callback])](#fsmkdirppath-callback)) is mixed in.
  * rmdirp `Boolean` _Optional_ _Default_: `true` Controls whether [fs.rmdirp(path, [callback])](#fsrmdirppath-callback)) is mixed in.
  * readdirp `Boolean` _Optional_ _Default_: `true` Controls whether [fs.readdirp(path, [callback])](#fsreaddirppath-callback)) is mixed in.
  * copyFile `Boolean` _Optional_ _Default_: `true` Controls whether [fs.copyFile(sourcePath, destinationPath, [callback])](#fscopyFilesourcePath-destinationPath-callback)) is mixed in.
  * copyDir `Boolean` _Optional_ _Default_: `true` Controls whether [fs.copyDir(sourcePath, destinationPath, [callback])](#fscopyDirsourcePath-destinationPath-callback)) is mixed in.
  
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
Proposed mixins.

For all methods callbacks are optional, if provided they will be used otherwise a promise will be returned.

### fs.mkdirp(path, [callback])
Recursively created directories if they don't exist.

```js
var fsWishlist = require('fs-wishlist');
var fs = require('fs');
var xfs =
```

### fs.rmdirp(path, [callback])
Recursively removes the given directory.

### fs.readdirp(path, [callback])
Recursively reads the given directory.

### fs.copyFile(sourcePath, destinationPath, [callback])
Copies a file from the source to the destination.

### fs.copyDir(sourcePath, destinationPath, [callback])
Recursively copies a directory from the source to the destination.
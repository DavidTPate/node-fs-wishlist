(function (module, path, Promise, mkdirp) {
    'use strict';

    function isFile(xfs, file) {
        return new Promise(function (resolve, reject) {
            xfs.stat(file, function (err, stats) {
                if (err) {
                    return reject(err);
                }
                if (!stats.isFile()) {
                    return reject(new Error('Path ' + file + ' is not a file'));
                }
                resolve();
            });
        });
    }

    function copyFile(xfs, sourceFile, destinationFile, options) {
        return new Promise(function (resolve, reject) {
            var readStream = xfs.createReadStream(sourceFile),
                writeStream = xfs.createWriteStream(destinationFile);
            readStream.on('error', reject);
            writeStream.on('error', reject);
            writeStream.on('close', resolve);
            readStream.pipe(writeStream);
        }).return();
    }

    module.exports = function (sourceFile, destinationFile, options, callback) {
        var self = this;
        if (typeof options === 'function') {
            callback = options;
            options = undefined;
        }

        var copyFilePromise = isFile(self, sourceFile).then(function () {
            return mkdirp.call(self, path.dirname(destinationFile), options).then(function () {
                return copyFile(self, sourceFile, destinationFile, options);
            });
        });

        if (!callback) {
            return copyFilePromise;
        }
        copyFilePromise.then(function () {
            callback();
        }, callback);
    };
}(module, require('path'), require('bluebird'), require('./mkdirp')));
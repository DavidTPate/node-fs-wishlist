(function (module, path, Promise, helper, mkdirp) {
    'use strict';

    function isFile(xfs, file) {
        return helper.isFile(xfs, file).then(function(isFile) {
            if (!isFile) {
                throw new Error('Path ' + file + ' is not a file');
            }
        });
    }

    function copyFile(xfs, sourceFile, destinationFile, options) {
        return new Promise(function (resolve, reject) {
            var readStream = xfs.createReadStream(sourceFile, options),
                writeStream = xfs.createWriteStream(destinationFile, options);
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
}(module, require('path'), require('bluebird'), require('./helper'), require('./mkdirp')));
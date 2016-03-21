'use strict';
(function (module, path, Promise, helper, copyFile, mkdirp) {

    function copyDirs(xfs, sourceDir, destinationDir) {
        return new Promise(function (resolve, reject) {
            xfs.readdir(sourceDir, function (err, files) {
                if (err) {
                    return reject(err);
                }

                if (files.length === 0) {
                    return resolve(mkdirp.call(xfs, destinationDir));
                }

                return resolve(Promise.all(files.map(function (file) {
                    var filePath = path.join(sourceDir, file);
                    return helper.isDirectory(xfs, filePath).then(function (isDir) {
                        if (isDir) {
                            return copyDirs(xfs, filePath, path.join(destinationDir, file));
                        }
                        return copyFile.call(xfs, filePath, path.join(destinationDir, file));
                    });
                })));
            });
        });
    }

    module.exports = function (sourceDir, destinationDir, callback) {
        var copyDirPromise = copyDirs(this, sourceDir, destinationDir);

        if (!callback) {
            return copyDirPromise;
        }
        copyDirPromise.then(function() {
            callback(null);
        }, callback);
    };
}(module, require('path'), require('bluebird'), require('./helper'), require('./copyFile'), require('./mkdirp')));
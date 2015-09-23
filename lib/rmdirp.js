(function (module, path, Promise, helper) {
    'use strict';

    function removeFile(xfs, filename) {
        return new Promise(function (resolve, reject) {
            xfs.unlink(filename, function (err) {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    function removeDirectory(xfs, dir) {
        return new Promise(function (resolve, reject) {
            xfs.rmdir(dir, function (err) {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    function rmdirs(xfs, dir) {
        return new Promise(function (resolve, reject) {
            xfs.readdir(dir, function (err, files) {
                if (err) {
                    if (err.code === 'ENOENT') {
                        // If we are trying to delete a directory that doesn't exist, then our job is done.
                        // This is how Node `fs.rmdir(...)` works because it is our rmdir(2) that it is based on works. See: http://linux.die.net/man/2/rmdir
                        return resolve();
                    }
                    return reject(err);
                }

                if (files.length === 0) {
                    return resolve(removeDirectory(xfs, dir));
                }

                return resolve(Promise.all(files.map(function (file) {
                    var filePath = path.join(dir, file);
                    return helper.isDirectory(xfs, filePath).then(function (isDir) {
                        if (isDir) {
                            return rmdirs(xfs, filePath);
                        }
                        return removeFile(xfs, filePath);
                    });
                })).then(function () {
                    return removeDirectory(xfs, dir);
                }));
            });
        });
    }

    module.exports = function (dir, callback) {
        var rmdirsPromise = rmdirs(this, dir);

        if (!callback) {
            return rmdirsPromise;
        }
        rmdirsPromise.then(function(result) {
            callback(null);
        }, callback);
    };
}(module, require('path'), require('bluebird'), require('./helper')));
(function (module, path, Promise, helper) {
    'use strict';

    function readdirs(xfs, dir) {
        return new Promise(function (resolve, reject) {
            xfs.readdir(dir, function (err, files) {
                if (err) {
                    return reject(err);
                }

                if (files.length === 0) {
                    return resolve([dir]);
                }

                return resolve(Promise.all(files.map(function (file) {
                    var filePath = path.join(dir, file);
                    return helper.isDirectory(xfs, filePath).then(function (isDir) {
                        if (isDir) {
                            return readdirs(xfs, filePath);
                        }
                        return filePath;
                    });
                })).then(function (files) {
                    files.unshift(dir);
                    return files;
                }));
            });
        }).reduce(function (files, file) {
            if (Array.isArray(file)) {
                files = files.concat(file);
            } else {
                files.push(file);
            }
            return files;
        }, []);
    }

    module.exports = function (dir, callback) {
        var readdirsPromise = readdirs(this, dir);

        if (!callback) {
            return readdirsPromise;
        }
        readdirsPromise.then(function(result) {
            callback(null, result);
        }, callback);
    };
}(module, require('path'), require('bluebird'), require('./helper')));
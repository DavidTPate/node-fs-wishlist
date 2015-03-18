(function (module, path, Promise) {
    'use strict';

    function isDirectory(xfs, dir) {
        return new Promise(function (resolve, reject) {
            xfs.stat(dir, function (err, stats) {
                if (err) {
                    return reject(err);
                }
                if (!stats.isDirectory()) {
                    return reject(new Error('Path ' + dir + ' already exists and is not a directory'));
                }
                resolve();
            });
        });
    }

    function mkdirs(xfs, dir, mode) {
        return new Promise(function (resolve, reject) {
            xfs.mkdir(dir, mode, function (err) {
                if (!err) {
                    return resolve();
                }
                switch (err.code) {
                    case 'ENOENT':
                        return resolve(mkdirs(xfs, path.dirname(dir), mode).then(function () {
                            return mkdirs(xfs, dir, mode);
                        }));
                    default:
                        return resolve(isDirectory(xfs, dir));
                }
            });
        }).return();
    }

    module.exports = function (dir, mode, callback) {
        if (typeof mode === 'function') {
            callback = mode;
            mode = undefined;
        }

        var mkdirsPromise = mkdirs(this, dir, mode);
        if (!callback) {
            return mkdirsPromise;
        }
        mkdirsPromise.then(function() {
            callback();
        }, callback);
    };
}(module, require('path'), require('bluebird')));
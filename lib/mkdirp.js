'use strict';
(function (module, path, Promise, helper) {

    function isDirectory(xfs, dir) {
        return helper.isDirectory(xfs, dir).then(function(isDir) {
           if (!isDir) {
               throw new Error('Path ' + dir + ' already exists and is not a directory');
           }
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
                    case 'EEXIST':
                        return resolve(isDirectory(xfs, dir));
                    default:
                        return reject(err);
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
}(module, require('path'), require('bluebird'), require('./helper')));
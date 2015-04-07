(function (module, Promise) {
    'use strict';

    function getStat(xfs, path) {
        return new Promise(function (resolve, reject) {
            xfs.stat(path, function (err, stats) {
                if (err) {
                    return reject(err);
                }
                resolve(stats);
            });
        });
    }

    function isDirectory(xfs, dir) {
        return getStat(xfs, dir).then(function(stats) {
           return stats.isDirectory();
        });
    }

    function isFile(xfs, file) {
        return getStat(xfs, file).then(function(stats) {
            return stats.isFile();
        });
    }

    module.exports = {
        isDirectory: isDirectory,
        isFile: isFile
    };
}(module, require('bluebird')));
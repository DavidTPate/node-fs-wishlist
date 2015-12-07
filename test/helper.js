(function (Promise) {
    'use strict';
    function createDirectories(fs, directories) {
        return Promise.all(directories).each(function (directory) {
            return fs.mkdirAsync(directory);
        });
    }

    function deleteDirectories(fs, directories) {
        return Promise.all(directories).each(function (directory) {
            return fs.rmdirAsync(directory);
        });
    }

    function unlinkPaths(fs, paths) {
        return Promise.all(paths).each(function (path) {
            return fs.unlinkAsync(path);
        });
    }

    function pathsExist(fs, paths) {
        return Promise.all(paths.map(function (path) {
            return new Promise(function (resolve) {
                fs.exists(path, resolve);
            });
        }));
    }

    module.exports = {
        createDirectories: createDirectories,
        deleteDirectories: deleteDirectories,
        pathsExist: pathsExist,
        unlinkPaths: unlinkPaths
    };
}(require('bluebird')));
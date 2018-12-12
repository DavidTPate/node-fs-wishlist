'use strict';
/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015-2016 Riptide Software Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const Promise = require('bluebird');

function readFiles(fs, files) {
    return Promise.map(files, function (file) {
        return fs.readFileAsync(file);
    });
}

function createDirectories(fs, directories) {
    return Promise.each(directories, function (directory) {
        return fs.mkdirAsync(directory);
    });
}

function deleteDirectories(fs, directories) {
    return Promise.each(directories, function (directory) {
        return fs.rmdirAsync(directory);
    });
}

function unlinkPaths(fs, paths) {
    return Promise.each(paths, function (path) {
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
    readFiles: readFiles,
    createDirectories: createDirectories,
    deleteDirectories: deleteDirectories,
    pathsExist: pathsExist,
    unlinkPaths: unlinkPaths
};
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
const path = require('path');
const Promise = require('bluebird');
const helper = require('./helper');

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
    rmdirsPromise.then(function () {
        callback(null);
    }, callback);
};
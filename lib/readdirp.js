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
(function (module, path, Promise, helper) {

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
                })).then(function (childFiles) {
                    childFiles.unshift(dir);
                    return childFiles;
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
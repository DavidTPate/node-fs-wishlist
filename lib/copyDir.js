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
const mkdirp = require('./mkdirp');

function copyDirs(xfs, sourceDir, destinationDir) {
    return new Promise((resolve, reject) => {
        xfs.readdir(sourceDir, (err, files) => {
            if (err) {
                return reject(err);
            }

            if (files.length === 0) {
                return resolve(mkdirp.call(xfs, destinationDir));
            }

            return resolve(Promise.all(files.map((file) => {
                const filePath = path.join(sourceDir, file);
                return helper.isDirectory(xfs, filePath).then((isDir) => {
                    if (isDir) {
                        return copyDirs(xfs, filePath, path.join(destinationDir, file));
                    }
                    return mkdirp.call(xfs, path.dirname(path.join(destinationDir, file))).then(() => {
                        return helper.copyFile(xfs, filePath, path.join(destinationDir, file));
                    });
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
    copyDirPromise.then(() => {
        callback(null);
    }, callback);
};
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
(function (module, path, Promise, helper, mkdirp) {

    function isFile(xfs, file) {
        return helper.isFile(xfs, file).then(function(isFileAFile) {
            if (!isFileAFile) {
                throw new Error('Path ' + file + ' is not a file');
            }
        });
    }

    function copyFile(xfs, sourceFile, destinationFile, options) {
        return new Promise(function (resolve, reject) {
            var readStream = xfs.createReadStream(sourceFile, options),
                writeStream = xfs.createWriteStream(destinationFile, options);
            readStream.on('error', reject);
            writeStream.on('error', reject);
            writeStream.on('close', resolve);
            readStream.pipe(writeStream);
        }).return();
    }

    module.exports = function (sourceFile, destinationFile, options, callback) {
        var self = this;
        if (typeof options === 'function') {
            callback = options;
            options = undefined;
        }

        var copyFilePromise = isFile(self, sourceFile).then(function () {
            return mkdirp.call(self, path.dirname(destinationFile), options).then(function () {
                return copyFile(self, sourceFile, destinationFile, options);
            });
        });

        if (!callback) {
            return copyFilePromise;
        }
        copyFilePromise.then(function () {
            callback();
        }, callback);
    };
}(module, require('path'), require('bluebird'), require('./helper'), require('./mkdirp')));
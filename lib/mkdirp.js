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

function isDirectory(xfs, dir) {
    return helper.isDirectory(xfs, dir).then(function (isDir) {
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
    mkdirsPromise.then(function () {
        callback();
    }, callback);
};
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
(function (module, extend, mkdirp, rmdirp, readdirp, copyDir) {

    var availableMixins = {
        mkdirp: mkdirp,
        rmdirp: rmdirp,
        readdirp: readdirp,
        copyDir: copyDir
    };

    function mixin(fs, options) {
        var opts = extend({
            mixins: {
                mkdirp: true,
                rmdirp: true,
                readdirp: true,
                copyDir: true
            }
        }, options || {});

        var mixins = {};

        Object.keys(opts.mixins).forEach(function (key) {
            if (opts.mixins[key]) {
                if (!fs[key]) {
                    mixins[key] = availableMixins[key];
                }
            }
        });

        return extend({}, fs, mixins);
    }

    function replace(options) {
        require.cache.fs = {
            exports: mixin(require('fs'), options)
        };
        return require.cache.fs.exports;
    }

    module.exports = {
        mixin: mixin,
        replace: replace
    };
}(module, require('extend'), require('./lib/mkdirp'), require('./lib/rmdirp'), require('./lib/readdirp'), require('./lib/copyDir')));

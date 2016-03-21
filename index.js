'use strict';
(function (module, extend, mkdirp, rmdirp, readdirp, copyFile, copyDir) {

    var availableMixins = {
        mkdirp: mkdirp,
        rmdirp: rmdirp,
        readdirp: readdirp,
        copyFile: copyFile,
        copyDir: copyDir
    };

    function mixin(fs, options) {
        var opts = extend({
            mixins: {
                mkdirp: true,
                rmdirp: true,
                readdirp: true,
                copyFile: true,
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
}(module, require('extend'), require('./lib/mkdirp'), require('./lib/rmdirp'), require('./lib/readdirp'), require('./lib/copyFile'), require('./lib/copyDir')));

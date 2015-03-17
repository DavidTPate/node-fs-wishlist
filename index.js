(function (module, extend, mkdirp, rmdirp) {
    'use strict';

    function mixin(fs, options) {
        var opts = extend({
            mixins: {
                mkdirp: true,
                rmdirp: true
            }
        }, options || {});

        var mixins = {};

        Object.keys(opts.mixins).forEach(function (key) {
            key = key.toLowerCase();

            if (opts.mixins[key]) {
                switch (key) {
                    case 'mkdirp':
                        if (!fs.mkdirp) {
                            mixins.mkdirp = mkdirp;
                        }
                        break;
                    case 'rmdirp':
                        if (!fs.rmdirp) {
                            mixins.rmdirp = rmdirp;
                        }
                        break;
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
}(module, require('extend'), require('./lib/mkdirp'), require('./lib/rmdirp')));

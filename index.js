(function (module, extend, mkdirp, rmdirp) {
    'use strict';

    module.exports = {
        mixin: function (fs, options) {
            options = options || {};
            options.mixins = options.mixins || {
                mkdirp: true,
                rmdirp: true
            };

            var mixins = {};

            Object.keys(options.mixins).forEach(function (key) {
                key = key.toLowerCase();

                if (options.mixins[key]) {
                    switch (key) {
                        case 'mkdirp':
                            mixins.mkdirp = mkdirp;
                            break;
                        case 'rmdirp':
                            mixins.rmdirp = rmdirp;
                            break;
                    }
                }
            });

            return extend({}, fs, mixins);
        }
    };
}(module, require('extend'), require('./lib/mkdirp'), require('./lib/rmdirp')));
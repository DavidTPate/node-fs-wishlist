(function (module, extend, mkdirp) {
    'use strict';

    module.exports = {
        mixin: function (fs, options) {
            options = options || {};
            options.mixins = options.mixins || {
                mkdirp: true
            };

            var mixins = {};

            Object.keys(options.mixins).forEach(function (key) {
                key = key.toLowerCase();

                if (options.mixins[key]) {
                    switch (key) {
                        case 'mkdirp':
                            if (!fs.mkdirp) {
                                mixins.mkdirp = mkdirp;
                            }
                            break;
                    }
                }
            });

            return extend({}, fs, mixins);
        }
    };
}(module, require('extend'), require('./lib/mkdirp')));
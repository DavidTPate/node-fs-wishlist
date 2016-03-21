'use strict';
(function (chai, chaiAsPromised, dirtyChai, Promise, lib) {

    chai.use(chaiAsPromised);
    chai.use(dirtyChai);
    var expect = chai.expect;

    describe('#replace', function () {
        afterEach(function () {
            delete require.cache.fs;
        });
        it('should replace fs with the mixed in fs', function () {
            expect(lib.replace()).to.equal(require('fs'));
        });
        it('should replace fs with the mixed in fs with options', function () {
            expect(lib.replace({
                mixins: {
                    mkdirp: true,
                    rmdirp: false
                }
            })).to.equal(require('fs'));

            expect(require('fs').mkdirp).to.be.ok();
            expect(require('fs').rmdirp).to.not.be.ok();
        });
    });
}(require('chai'), require('chai-as-promised'), require('dirty-chai'), require('bluebird'), require('../index')));
(function (chai, chaiAsPromised, dirtyChai, Promise, lib, fs, extend) {
    'use strict';

    fs = Promise.promisifyAll(fs);

    fs.existsAsync = function (path) {
        return new Promise(function (resolve, reject) {
            fs.exists(path, function (exists) {
                resolve(exists);
            });
        });
    };

    chai.use(chaiAsPromised);
    chai.use(dirtyChai);
    var expect = chai.expect,
        testFolder = 'test/mock';

    describe('#mkdirp', function () {
        beforeEach(function () {
            return fs.mkdirAsync(testFolder);
        });
        afterEach(function () {
            return fs.rmdirAsync(testFolder);
        });
        it('should mixin mkdirp by default', function () {
            expect(lib.mixin(fs)).to.have.property('mkdirp');
        });
        it('should mixin mkdirp when included', function () {
            expect(lib.mixin(fs, {mixins: {mkdirp: true}})).to.have.property('mkdirp');
        });
        it('shouldn\'t mixin mkdirp when excluded', function () {
            expect(lib.mixin(fs, {mixins: {mkdirp: false}})).to.not.have.property('mkdirp');
        });
        it('should be able to recursively make directories', function () {
            return lib.mixin(fs).mkdirp(testFolder + '/one/two/three/four').then(function () {
                return Promise.all([
                    fs.existsAsync(testFolder + '/one'),
                    fs.existsAsync(testFolder + '/one/two'),
                    fs.existsAsync(testFolder + '/one/two/three'),
                    fs.existsAsync(testFolder + '/one/two/three/four')
                ]).spread(function (one, two, three, four) {
                    return new Promise(function (resolve, reject) {
                        expect(one).to.be.ok();
                        expect(two).to.be.ok();
                        expect(three).to.be.ok();
                        expect(four).to.be.ok();

                        resolve();
                    });
                });
            }).finally(function () {
                return fs.rmdirAsync(testFolder + '/one/two/three/four').then(function () {
                    return fs.rmdirAsync(testFolder + '/one/two/three').then(function () {
                        return fs.rmdirAsync(testFolder + '/one/two').then(function () {
                            return fs.rmdirAsync(testFolder + '/one');
                        });
                    });
                });
            });
        });
        it('should be able to recursively make directories with a callback', function () {
            return new Promise(function (resolve, reject) {
                lib.mixin(fs).mkdirp(testFolder + '/one', function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(fs.existsAsync(testFolder + '/one').then(function (exists) {
                        return expect(exists).to.be.ok();
                    }));
                });
            }).finally(function () {
                    return fs.rmdirAsync(testFolder + '/one');
                });
        });
        it('should be able to recursively make directories with a mode', function () {
            var mode = parseInt('0776', 8);
            return lib.mixin(fs).mkdirp(testFolder + '/one/two', mode).then(function () {
                return Promise.all([
                    fs.existsAsync(testFolder + '/one'),
                    fs.existsAsync(testFolder + '/one/two')
                ]).spread(function (one, two) {
                    expect(one).to.be.ok();
                    expect(two).to.be.ok();

                    return Promise.all([
                        fs.statAsync(testFolder + '/one'),
                        fs.statAsync(testFolder + '/one/two')
                    ]).spread(function (oneStats, twoStats) {
                        return new Promise(function (resolve, reject) {
                            expect(oneStats).to.be.ok();
                            expect(twoStats).to.be.ok();

                            expect(oneStats.mode & mode).to.equal(mode & (~process.umask()));
                            expect(twoStats.mode & mode).to.equal(mode & (~process.umask()));

                            resolve();
                        });
                    });
                });
            }).finally(function () {
                return fs.rmdirAsync(testFolder + '/one/two').then(function () {
                    return fs.rmdirAsync(testFolder + '/one');
                });
            });
        });
        it('should be able to recursively make directories with a mode and callback', function () {
            var mode = parseInt('0776', 8);
            return new Promise(function (resolve, reject) {
                lib.mixin(fs).mkdirp(testFolder + '/one', mode, function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(fs.existsAsync(testFolder + '/one').then(function (exists) {
                        expect(exists).to.be.ok();

                        return fs.statAsync(testFolder + '/one').then(function (stats) {
                            expect(stats.mode & mode).to.equal(mode & (~process.umask()));
                        });
                    }));
                });
            }).finally(function () {
                    return fs.rmdirAsync(testFolder + '/one');
                });
        });
        it('shouldn\'t be able to overwrite a directory that already exists and isn\'t a directory', function () {
            return fs.writeFileAsync(testFolder + '/one').then(function() {
                return expect(lib.mixin(fs).mkdirp(testFolder + '/one')).to.eventually.be.rejectedWith(Error, 'Path test/mock/one already exists and is not a directory');
            }).finally(function() {
                return fs.unlink(testFolder + '/one');
            });
        });
        it('should be able to able to create a directory that already exists', function () {
            return fs.mkdirAsync(testFolder + '/one').then(function() {
                return expect(lib.mixin(fs).mkdirp(testFolder + '/one')).to.eventually.be.fulfilled();
            }).finally(function() {
                return fs.rmdir(testFolder + '/one');
            });
        });
        it('should propagate an error from a stats call', function () {
            var xfs = extend({}, lib.mixin(fs), { stat: function(dir, cb) { cb(new Error('Some Stats Error')); } });
            return fs.mkdirAsync(testFolder + '/one').then(function() {
                return expect(xfs.mkdirp(testFolder + '/one')).to.eventually.be.rejectedWith(Error, 'Some Stats Error');
            }).finally(function() {
                return fs.rmdir(testFolder + '/one');
            });
        });
    });
}(require('chai'), require('chai-as-promised'), require('dirty-chai'), require('bluebird'), require('../index'), require('fs'), require('extend')));
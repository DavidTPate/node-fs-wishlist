(function (chai, chaiAsPromised, dirtyChai, Promise, lib, fs, extend) {
    'use strict';

    if (!fs.existsAsync) {
        fs = Promise.promisifyAll(fs);

        fs.existsAsync = function (path) {
            return new Promise(function (resolve, reject) {
                fs.exists(path, function (exists) {
                    resolve(exists);
                });
            });
        };
    }

    chai.use(chaiAsPromised);
    chai.use(dirtyChai);
    var expect = chai.expect,
        testFolder = 'test/mock';

    describe('#rmdirp', function () {
        beforeEach(function () {
            return fs.mkdirAsync(testFolder);
        });
        afterEach(function () {
            return fs.rmdirAsync(testFolder);
        });
        it('should mixin rmdirp by default', function () {
            expect(lib.mixin(fs)).to.have.property('rmdirp');
        });
        it('shouldn\'t mixin rmdirp when already implemented', function () {
            var rmdirpFunc = function() {};
            expect(lib.mixin(extend({}, fs, {rmdirp: rmdirpFunc})).rmdirp).to.equal(rmdirpFunc);
        });
        it('should mixin rmdirp when included', function () {
            expect(lib.mixin(fs, {mixins: {rmdirp: true}})).to.have.property('rmdirp');
        });
        it('shouldn\'t mixin rmdirp when excluded', function () {
            expect(lib.mixin(fs, {mixins: {rmdirp: false}})).to.not.have.property('rmdirp');
        });
        it('should be able to recursively remove directories', function () {
            return fs.mkdirAsync(testFolder + '/one').then(function () {
                return fs.mkdirAsync(testFolder + '/one/two').then(function () {
                    return fs.mkdirAsync(testFolder + '/one/two/three').then(function () {
                        return fs.mkdirAsync(testFolder + '/one/two/three/four').then(function () {
                            return fs.mkdirAsync(testFolder + '/one/two/three/four/five');
                        });
                    });
                });
            }).then(function () {
                return Promise.all([
                    fs.writeFileAsync(testFolder + '/1.txt', 'The impossible often has a kind of integrity to it which the merely improbable lacks.'),
                    fs.writeFileAsync(testFolder + '/one/2.txt', 'It can be very dangerous to see things from somebody else\'s point of view without the proper training.'),
                    fs.writeFileAsync(testFolder + '/one/two/3.txt', 'He was a dreamer, a thinker, a speculative philosopher... or, as his wife would have it, an idiot.'),
                    fs.writeFileAsync(testFolder + '/one/two/three/4.txt', 'See first, think later, then test. But always see first. Otherwise you will only see what you were expecting. Most scientists forget that.'),
                    fs.writeFileAsync(testFolder + '/one/two/three/four/5.txt', 'One is never alone with a rubber duck.'),
                    fs.writeFileAsync(testFolder + '/one/two/three/four/6.txt', 'Anything that thinks logically can be fooled by something else that thinks at least as logically as it does.')
                ]);
            }).then(function () {
                return lib.mixin(fs).rmdirp(testFolder + '/one');
            }).then(function () {
                return Promise.all([
                    fs.existsAsync(testFolder + '/1.txt'),
                    fs.existsAsync(testFolder + '/one'),
                    fs.existsAsync(testFolder + '/one/2.txt'),
                    fs.existsAsync(testFolder + '/one/two'),
                    fs.existsAsync(testFolder + '/one/two/3.txt'),
                    fs.existsAsync(testFolder + '/one/two/three'),
                    fs.existsAsync(testFolder + '/one/two/three/4.txt'),
                    fs.existsAsync(testFolder + '/one/two/three/four'),
                    fs.existsAsync(testFolder + '/one/two/three/four/5.txt'),
                    fs.existsAsync(testFolder + '/one/two/three/four/6.txt'),
                    fs.existsAsync(testFolder + '/one/two/three/four/five')
                ]).then(function (results) {
                    return new Promise(function (resolve, reject) {
                        expect(results).to.deep.equal([true, false, false, false, false, false, false, false, false, false, false]);
                        resolve();
                    });
                });
            }).finally(function () {
                return fs.unlinkAsync(testFolder + '/1.txt');
            });
        });
        it('should be able to recursively remove directories with a callback', function () {
            return fs.mkdirAsync(testFolder + '/one').then(function () {
                return new Promise(function (resolve, reject) {
                    lib.mixin(fs).rmdirp(testFolder + '/one', function (err) {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                });
            }).then(function () {
                return expect(fs.existsAsync(testFolder + '/one')).to.eventually.equal(false);
            });
        });
        it('shouldn\'t be able to remove a directory that already exists and isn\'t a directory', function () {
            return fs.writeFileAsync(testFolder + '/one', 'The ships hung in the sky in much the same way bricks don\'t.').then(function () {
                return expect(lib.mixin(fs).rmdirp(testFolder + '/one')).to.eventually.be.rejectedWith(Error, /^ENOTDIR/);
            }).finally(function () {
                return fs.unlink(testFolder + '/one');
            });
        });
        it('shouldn\'t be able to remove a directory that doesn\'t exist', function () {
            return expect(lib.mixin(fs).rmdirp(testFolder + '/one')).to.eventually.be.rejectedWith(Error, /^ENOENT/);
        });
        it('should propagate an error from a stats call', function () {
            var xfs = extend({}, lib.mixin(fs), {
                stat: function (dir, cb) {
                    cb(new Error('Some Stats Error'));
                }
            });
            return Promise.all([
                fs.mkdirAsync(testFolder + '/one'),
                fs.writeFileAsync(testFolder + '/one/1.txt', 'In an infinite Universe anything can happen.')
            ]).then(function () {
                return expect(xfs.rmdirp(testFolder + '/one')).to.eventually.be.rejectedWith(Error, 'Some Stats Error');
            }).finally(function () {
                return fs.unlinkAsync(testFolder + '/one/1.txt').then(function () {
                    return fs.rmdir(testFolder + '/one');
                });
            });
        });
        it('should propagate an error from an unlink call', function () {
            var xfs = extend({}, lib.mixin(fs), {
                unlink: function (dir, cb) {
                    cb(new Error('Some Unlink Error'));
                }
            });
            return Promise.all([
                fs.mkdirAsync(testFolder + '/one'),
                fs.writeFileAsync(testFolder + '/one/1.txt', 'In an infinite Universe anything can happen.')
            ]).then(function () {
                return expect(xfs.rmdirp(testFolder + '/one')).to.eventually.be.rejectedWith(Error, 'Some Unlink Error');
            }).finally(function () {
                return fs.unlinkAsync(testFolder + '/one/1.txt').then(function () {
                    return fs.rmdir(testFolder + '/one');
                });
            });
        });
        it('should propagate an error from a rmdir call', function () {
            var xfs = extend({}, lib.mixin(fs), {
                rmdir: function (dir, cb) {
                    cb(new Error('Some Rmdir Error'));
                }
            });
            return fs.mkdirAsync(testFolder + '/one').then(function () {
                return expect(xfs.rmdirp(testFolder + '/one')).to.eventually.be.rejectedWith(Error, 'Some Rmdir Error');
            }).finally(function () {
                return fs.rmdir(testFolder + '/one');
            });
        });
    });
}(require('chai'), require('chai-as-promised'), require('dirty-chai'), require('bluebird'), require('../index'), require('fs'), require('extend')));
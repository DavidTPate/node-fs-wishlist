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

    describe('#copyFile', function () {
        beforeEach(function () {
            return fs.mkdirAsync(testFolder);
        });
        afterEach(function () {
            return fs.rmdirAsync(testFolder);
        });
        it('should mixin copyFile by default', function () {
            expect(lib.mixin(fs)).to.have.property('copyFile');
        });
        it('shouldn\'t mixin copyFile when already implemented', function () {
            var copyFileFunc = function () {
            };
            expect(lib.mixin(extend({}, fs, {copyFile: copyFileFunc})).copyFile).to.equal(copyFileFunc);
        });
        it('should mixin copyFile when included', function () {
            expect(lib.mixin(fs, {mixins: {copyFile: true}})).to.have.property('copyFile');
        });
        it('shouldn\'t mixin copyFile when excluded', function () {
            expect(lib.mixin(fs, {mixins: {copyFile: false}})).to.not.have.property('copyFile');
        });
        it('should be able to copy a file', function () {
            return fs.mkdirAsync(testFolder + '/one').then(function () {
                return fs.writeFileAsync(testFolder + '/one/2.txt', 'You know what a learning experience is? A learning experience is one of those things that says, "You know that thing you just did? Don\'t do that.');
            }).then(function () {
                return lib.mixin(fs).copyFile(testFolder + '/one/2.txt', testFolder + '/two/3.txt');
            }).then(function () {
                return Promise.all([
                    fs.existsAsync(testFolder + '/one'),
                    fs.existsAsync(testFolder + '/one/2.txt'),
                    fs.existsAsync(testFolder + '/two'),
                    fs.existsAsync(testFolder + '/two/3.txt')
                ]).then(function (results) {
                    return new Promise(function (resolve, reject) {
                        expect(results).to.deep.equal([true, true, true, true]);
                        resolve(Promise.all([
                            fs.readFileAsync(testFolder + '/one/2.txt'),
                            fs.readFileAsync(testFolder + '/two/3.txt')
                        ]).spread(function (original, copied) {
                            expect(original.toString()).to.equal(copied.toString());
                        }));
                    });
                });
            }).finally(function () {
                return Promise.all([
                    fs.unlinkAsync(testFolder + '/one/2.txt'),
                    fs.unlinkAsync(testFolder + '/two/3.txt')
                ]).then(function () {
                    return Promise.all([
                        fs.rmdirAsync(testFolder + '/one'),
                        fs.rmdirAsync(testFolder + '/two')
                    ]);
                });
            });
        });
        it('should be able to copy a file with a callback', function () {
            return fs.mkdirAsync(testFolder + '/one').then(function () {
                return fs.writeFileAsync(testFolder + '/one/2.txt', 'And so the problem remained; lots of people were mean, and most were miserable, even the ones with digital watches.');
            }).then(function () {
                return new Promise(function (resolve, reject) {
                    lib.mixin(fs).copyFile(testFolder + '/one/2.txt', testFolder + '/two/3.txt', function (err) {
                        if (err) {
                            return reject(err);
                        }

                        resolve(Promise.all([
                            fs.existsAsync(testFolder + '/one'),
                            fs.existsAsync(testFolder + '/one/2.txt'),
                            fs.existsAsync(testFolder + '/two'),
                            fs.existsAsync(testFolder + '/two/3.txt')
                        ]).then(function (results) {
                            return new Promise(function (resolve, reject) {
                                expect(results).to.deep.equal([true, true, true, true]);
                                resolve(Promise.all([
                                    fs.readFileAsync(testFolder + '/one/2.txt'),
                                    fs.readFileAsync(testFolder + '/two/3.txt')
                                ]).spread(function (original, copied) {
                                    expect(original.toString()).to.equal(copied.toString());
                                }));
                            });
                        }));
                    });
                });
            }).finally(function () {
                return Promise.all([
                    fs.unlinkAsync(testFolder + '/one/2.txt'),
                    fs.unlinkAsync(testFolder + '/two/3.txt')
                ]).then(function () {
                    return Promise.all([
                        fs.rmdirAsync(testFolder + '/one'),
                        fs.rmdirAsync(testFolder + '/two')
                    ]);
                });
            });
        });
        it('shouldn\'t be able to copy a directory', function () {
            return fs.mkdirAsync(testFolder + '/one').then(function() {
                return expect(lib.mixin(fs).copyFile(testFolder + '/one')).to.eventually.be.rejectedWith(Error, 'Path test/mock/one is not a file');
            }).finally(function () {
                return fs.rmdirAsync(testFolder + '/one');
            });
        });
        it('shouldn\'t be able to copy a file that doesn\'t exist', function () {
            return expect(lib.mixin(fs).copyFile(testFolder + '/one/1.txt')).to.eventually.be.rejectedWith(Error, /^ENOENT/);
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
                return expect(xfs.copyFile(testFolder + '/one')).to.eventually.be.rejectedWith(Error, 'Some Stats Error');
            }).finally(function () {
                return fs.unlinkAsync(testFolder + '/one/1.txt').then(function () {
                    return fs.rmdir(testFolder + '/one');
                });
            });
        });
    });
}(require('chai'), require('chai-as-promised'), require('dirty-chai'), require('bluebird'), require('../index'), require('fs'), require('extend')));
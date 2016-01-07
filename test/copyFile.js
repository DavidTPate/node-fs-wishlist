(function (chai, chaiAsPromised, dirtyChai, Promise, lib, fs, extend, helper) {
    'use strict';

    fs = Promise.promisifyAll(fs);

    chai.use(chaiAsPromised);
    chai.use(dirtyChai);

    var expect = chai.expect;
    var testFolder = 'test/mock';
    var mixedFs = lib.mixin(fs);

    describe('#copyFile', function () {
        beforeEach(function () {
            return mixedFs.rmdirp(testFolder)
                .then(function () {
                    return mixedFs.mkdirp(testFolder);
                });
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
                return helper.pathsExist(fs, [
                    testFolder + '/one',
                    testFolder + '/one/2.txt',
                    testFolder + '/two',
                    testFolder + '/two/3.txt'
                ]).then(function (results) {
                    return new Promise(function (resolve) {
                        expect(results).to.deep.equal([true, true, true, true]);
                        resolve(helper.readFiles(fs, [
                            testFolder + '/one/2.txt',
                            testFolder + '/two/3.txt'
                        ]).spread(function (original, copied) {
                            expect(original.toString()).to.equal(copied.toString());
                        }));
                    });
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

                        return resolve(helper.pathsExist(fs, [
                            testFolder + '/one',
                            testFolder + '/one/2.txt',
                            testFolder + '/two',
                            testFolder + '/two/3.txt'
                        ]).then(function (results) {
                            return new Promise(function (readFileResolve) {
                                expect(results).to.deep.equal([true, true, true, true]);
                                readFileResolve(helper.readFiles(fs, [
                                    testFolder + '/one/2.txt',
                                    testFolder + '/two/3.txt'
                                ]).spread(function (original, copied) {
                                    expect(original.toString()).to.equal(copied.toString());
                                }));
                            });
                        }));
                    });
                });
            });
        });
        it('shouldn\'t be able to copy a directory', function () {
            return fs.mkdirAsync(testFolder + '/one').then(function () {
                return expect(lib.mixin(fs).copyFile(testFolder + '/one')).to.eventually.be.rejectedWith(Error, 'Path test/mock/one is not a file');
            });
        });
        it('shouldn\'t be able to copy a file that doesn\'t exist', function () {
            return expect(lib.mixin(fs).copyFile(testFolder + '/one/1.txt')).to.eventually.be.rejectedWith(Error, /ENOENT/);
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
            });
        });
    });
}(require('chai'), require('chai-as-promised'), require('dirty-chai'), require('bluebird'), require('../index'), require('fs'), require('extend'), require('./helper')));
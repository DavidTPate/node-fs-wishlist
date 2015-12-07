(function (chai, chaiAsPromised, dirtyChai, Promise, lib, fs, extend, helper) {
    'use strict';

    if (!fs.existsAsync) {
        fs = Promise.promisifyAll(fs);

        fs.existsAsync = function (path) {
            return new Promise(function (resolve) {
                fs.exists(path, resolve);
            });
        };
    }

    chai.use(chaiAsPromised);
    chai.use(dirtyChai);

    var expect = chai.expect;
    var testFolder = 'test/mock';
    var mixedFs = lib.mixin(fs);

    describe('#copyDir', function () {
        beforeEach(function () {
            return mixedFs.rmdirp(testFolder)
                .then(function () {
                    return mixedFs.mkdirp(testFolder);
                });
        });
        it('should mixin copyDir by default', function () {
            expect(mixedFs).to.have.property('copyDir');
        });
        it('shouldn\'t mixin copyDir when already implemented', function () {
            var copyDirFunc = function () {
            };
            expect(lib.mixin(extend({}, fs, {copyDir: copyDirFunc})).copyDir).to.equal(copyDirFunc);
        });
        it('should mixin copyDir when included', function () {
            expect(lib.mixin(fs, {mixins: {copyDir: true}})).to.have.property('copyDir');
        });
        it('shouldn\'t mixin copyDir when excluded', function () {
            expect(lib.mixin(fs, {mixins: {copyDir: false}})).to.not.have.property('copyDir');
        });
        it('should be able to recursively copy directories', function () {
            return helper.createDirectories(fs, [
                testFolder + '/one',
                testFolder + '/one/two',
                testFolder + '/one/two/three',
                testFolder + '/one/two/three/four',
                testFolder + '/one/two/three/four/five'
            ]).then(function () {
                return Promise.all([
                    fs.writeFileAsync(testFolder + '/one/2.txt', 'It can be very dangerous to see things from somebody else\'s point of view without the proper training.'),
                    fs.writeFileAsync(testFolder + '/one/two/3.txt', 'He was a dreamer, a thinker, a speculative philosopher... or, as his wife would have it, an idiot.'),
                    fs.writeFileAsync(testFolder + '/one/two/three/4.txt', 'See first, think later, then test. But always see first. Otherwise you will only see what you were expecting. Most scientists forget that.'),
                    fs.writeFileAsync(testFolder + '/one/two/three/four/5.txt', 'One is never alone with a rubber duck.'),
                    fs.writeFileAsync(testFolder + '/one/two/three/four/6.txt', 'Anything that thinks logically can be fooled by something else that thinks at least as logically as it does.')
                ]);
            }).then(function () {
                return mixedFs.copyDir(testFolder + '/one', testFolder + '/anotherOne');
            }).then(function () {
                return helper.pathsExist(fs, [
                    testFolder + '/one',
                    testFolder + '/one/2.txt',
                    testFolder + '/one/two',
                    testFolder + '/one/two/3.txt',
                    testFolder + '/one/two/three',
                    testFolder + '/one/two/three/4.txt',
                    testFolder + '/one/two/three/four',
                    testFolder + '/one/two/three/four/5.txt',
                    testFolder + '/one/two/three/four/6.txt',
                    testFolder + '/one/two/three/four/five',
                    testFolder + '/anotherOne',
                    testFolder + '/anotherOne/2.txt',
                    testFolder + '/anotherOne/two',
                    testFolder + '/anotherOne/two/3.txt',
                    testFolder + '/anotherOne/two/three',
                    testFolder + '/anotherOne/two/three/4.txt',
                    testFolder + '/anotherOne/two/three/four',
                    testFolder + '/anotherOne/two/three/four/5.txt',
                    testFolder + '/anotherOne/two/three/four/6.txt',
                    testFolder + '/anotherOne/two/three/four/five'
                ]).then(function (results) {
                    expect(results).to.deep.equal([true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]);
                    return Promise.all([
                        Promise.all([
                            fs.readFileAsync(testFolder + '/one/2.txt'),
                            fs.readFileAsync(testFolder + '/one/two/3.txt'),
                            fs.readFileAsync(testFolder + '/one/two/three/4.txt'),
                            fs.readFileAsync(testFolder + '/one/two/three/four/5.txt'),
                            fs.readFileAsync(testFolder + '/one/two/three/four/6.txt')
                        ]),
                        Promise.all([
                            fs.readFileAsync(testFolder + '/anotherOne/2.txt'),
                            fs.readFileAsync(testFolder + '/anotherOne/two/3.txt'),
                            fs.readFileAsync(testFolder + '/anotherOne/two/three/4.txt'),
                            fs.readFileAsync(testFolder + '/anotherOne/two/three/four/5.txt'),
                            fs.readFileAsync(testFolder + '/anotherOne/two/three/four/6.txt')
                        ])
                    ]).spread(function (originalFiles, copiedFiles) {
                        for (var i = 0; i < originalFiles.length; i++) {
                            expect(originalFiles[i].toString()).to.equal(copiedFiles[i].toString());
                        }
                    });
                });
            });
        });
        it('should be able to recursively copy directories with a callback', function () {
            return fs.mkdirAsync(testFolder + '/one').then(function () {
                return new Promise(function (resolve, reject) {
                    mixedFs.copyDir(testFolder + '/one', testFolder + '/anotherOne', function (err) {
                        if (err) {
                            return reject(err);
                        }
                        resolve();
                    });
                });
            }).then(function () {
                return Promise.all([
                    fs.existsAsync(testFolder + '/one'),
                    fs.existsAsync(testFolder + '/anotherOne')
                ]).then(function (results) {
                    expect(results).to.deep.equal([true, true]);
                });
            });
        });
        it('shouldn\'t be able to copy a directory that is actually a file', function () {
            return fs.writeFileAsync(testFolder + '/one', 'I\'d far rather be happy than right anyday.').then(function () {
                return expect(mixedFs.copyDir(testFolder + '/one', testFolder + '/anotherOne')).to.eventually.be.rejectedWith(Error, /ENOTDIR/);
            });
        });
        it('shouldn\'t be able to copy a directory that doesn\'t exist', function () {
            return expect(mixedFs.copyDir(testFolder + '/one', testFolder + '/anotherOne')).to.eventually.be.rejectedWith(Error, /ENOENT/);
        });
        it('should propagate an error from a stats call', function () {
            var xfs = extend({}, mixedFs, {
                stat: function (dir, cb) {
                    cb(new Error('Some Stats Error'));
                }
            });
            return fs.mkdirAsync(testFolder + '/one').then(function () {
                return fs.writeFileAsync(testFolder + '/one/1.txt', 'In an infinite Universe anything can happen.');
            }).then(function () {
                return expect(xfs.copyDir(testFolder + '/one')).to.eventually.be.rejectedWith(Error, 'Some Stats Error');
            });
        });
        it('should propagate an error from a mkdir call', function () {
            var xfs = extend({}, mixedFs, {
                mkdir: function (dir, cb) {
                    cb(new Error('Some Mkdir Error'));
                }
            });
            return fs.mkdirAsync(testFolder + '/one').then(function () {
                return expect(xfs.copyDir(testFolder + '/one', testFolder + '/anotherOne')).to.eventually.be.rejectedWith(Error, 'Some Mkdir Error');
            });
        });
    });
}(require('chai'), require('chai-as-promised'), require('dirty-chai'), require('bluebird'), require('../index'), require('fs'), require('extend'), require('./helper')));
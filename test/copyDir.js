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

    describe('#copyDir', function () {
        beforeEach(function () {
            return fs.mkdirAsync(testFolder);
        });
        afterEach(function () {
            return fs.rmdirAsync(testFolder);
        });
        it('should mixin copyDir by default', function () {
            expect(lib.mixin(fs)).to.have.property('copyDir');
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
                    fs.writeFileAsync(testFolder + '/one/2.txt', 'It can be very dangerous to see things from somebody else\'s point of view without the proper training.'),
                    fs.writeFileAsync(testFolder + '/one/two/3.txt', 'He was a dreamer, a thinker, a speculative philosopher... or, as his wife would have it, an idiot.'),
                    fs.writeFileAsync(testFolder + '/one/two/three/4.txt', 'See first, think later, then test. But always see first. Otherwise you will only see what you were expecting. Most scientists forget that.'),
                    fs.writeFileAsync(testFolder + '/one/two/three/four/5.txt', 'One is never alone with a rubber duck.'),
                    fs.writeFileAsync(testFolder + '/one/two/three/four/6.txt', 'Anything that thinks logically can be fooled by something else that thinks at least as logically as it does.')
                ]);
            }).then(function () {
                return lib.mixin(fs).copyDir(testFolder + '/one', testFolder + '/anotherOne');
            }).then(function () {
                return Promise.all([
                    fs.existsAsync(testFolder + '/one'),
                    fs.existsAsync(testFolder + '/one/2.txt'),
                    fs.existsAsync(testFolder + '/one/two'),
                    fs.existsAsync(testFolder + '/one/two/3.txt'),
                    fs.existsAsync(testFolder + '/one/two/three'),
                    fs.existsAsync(testFolder + '/one/two/three/4.txt'),
                    fs.existsAsync(testFolder + '/one/two/three/four'),
                    fs.existsAsync(testFolder + '/one/two/three/four/5.txt'),
                    fs.existsAsync(testFolder + '/one/two/three/four/6.txt'),
                    fs.existsAsync(testFolder + '/one/two/three/four/five'),
                    fs.existsAsync(testFolder + '/anotherOne'),
                    fs.existsAsync(testFolder + '/anotherOne/2.txt'),
                    fs.existsAsync(testFolder + '/anotherOne/two'),
                    fs.existsAsync(testFolder + '/anotherOne/two/3.txt'),
                    fs.existsAsync(testFolder + '/anotherOne/two/three'),
                    fs.existsAsync(testFolder + '/anotherOne/two/three/4.txt'),
                    fs.existsAsync(testFolder + '/anotherOne/two/three/four'),
                    fs.existsAsync(testFolder + '/anotherOne/two/three/four/5.txt'),
                    fs.existsAsync(testFolder + '/anotherOne/two/three/four/6.txt'),
                    fs.existsAsync(testFolder + '/anotherOne/two/three/four/five')
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
            }).finally(function () {
                return Promise.all([
                    fs.unlinkAsync(testFolder + '/one/2.txt'),
                    fs.unlinkAsync(testFolder + '/one/two/3.txt'),
                    fs.unlinkAsync(testFolder + '/one/two/three/4.txt'),
                    fs.unlinkAsync(testFolder + '/one/two/three/four/5.txt'),
                    fs.unlinkAsync(testFolder + '/one/two/three/four/6.txt'),
                    fs.unlinkAsync(testFolder + '/anotherOne/2.txt'),
                    fs.unlinkAsync(testFolder + '/anotherOne/two/3.txt'),
                    fs.unlinkAsync(testFolder + '/anotherOne/two/three/4.txt'),
                    fs.unlinkAsync(testFolder + '/anotherOne/two/three/four/5.txt'),
                    fs.unlinkAsync(testFolder + '/anotherOne/two/three/four/6.txt')
                ]).then(function () {
                    return Promise.all([
                        fs.rmdirAsync(testFolder + '/one/two/three/four/five').then(function () {
                            return fs.rmdirAsync(testFolder + '/one/two/three/four').then(function () {
                                return fs.rmdirAsync(testFolder + '/one/two/three').then(function () {
                                    return fs.rmdirAsync(testFolder + '/one/two').then(function () {
                                        return fs.rmdirAsync(testFolder + '/one');
                                    });
                                });
                            });
                        }),
                        fs.rmdirAsync(testFolder + '/anotherOne/two/three/four/five').then(function () {
                            return fs.rmdirAsync(testFolder + '/anotherOne/two/three/four').then(function () {
                                return fs.rmdirAsync(testFolder + '/anotherOne/two/three').then(function () {
                                    return fs.rmdirAsync(testFolder + '/anotherOne/two').then(function () {
                                        return fs.rmdirAsync(testFolder + '/anotherOne');
                                    });
                                });
                            });
                        })
                    ]);
                });
            });
        });
        it('should be able to recursively copy directories with a callback', function () {
            return fs.mkdirAsync(testFolder + '/one').then(function () {
                return new Promise(function (resolve, reject) {
                    lib.mixin(fs).copyDir(testFolder + '/one', testFolder + '/anotherOne', function (err) {
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
                ]).then(function(results) {
                   expect(results).to.deep.equal([true, true]);
                });
            }).finally(function() {
                return Promise.all([
                    fs.rmdirAsync(testFolder + '/one'),
                    fs.rmdirAsync(testFolder + '/anotherOne')
                ]);
            });
        });
        it('shouldn\'t be able to copy a directory that is actually a file', function () {
            return fs.writeFileAsync(testFolder + '/one', 'I\'d far rather be happy than right anyday.').then(function () {
                return expect(lib.mixin(fs).copyDir(testFolder + '/one', testFolder + '/anotherOne')).to.eventually.be.rejectedWith(Error, /^ENOTDIR/);
            }).finally(function () {
                return fs.unlink(testFolder + '/one');
            });
        });
        it('shouldn\'t be able to copy a directory that doesn\'t exist', function () {
            return expect(lib.mixin(fs).copyDir(testFolder + '/one', testFolder + '/anotherOne')).to.eventually.be.rejectedWith(Error, /^ENOENT/);
        });
        it('should propagate an error from a stats call', function () {
            var xfs = extend({}, lib.mixin(fs), {
                stat: function (dir, cb) {
                    cb(new Error('Some Stats Error'));
                }
            });
            return fs.mkdirAsync(testFolder + '/one').then(function() {
                return fs.writeFileAsync(testFolder + '/one/1.txt', 'In an infinite Universe anything can happen.');
            }).then(function () {
                return expect(xfs.copyDir(testFolder + '/one')).to.eventually.be.rejectedWith(Error, 'Some Stats Error');
            }).finally(function () {
                return fs.unlinkAsync(testFolder + '/one/1.txt').then(function () {
                    return fs.rmdir(testFolder + '/one');
                });
            });
        });
        it('should propagate an error from a mkdir call', function () {
            var xfs = extend({}, lib.mixin(fs), {
                mkdir: function (dir, cb) {
                    cb(new Error('Some Mkdir Error'));
                }
            });
            return fs.mkdirAsync(testFolder + '/one').then(function () {
                return expect(xfs.copyDir(testFolder + '/one', testFolder +'/anotherOne')).to.eventually.be.rejectedWith(Error, 'Some Mkdir Error');
            }).finally(function () {
                return fs.rmdir(testFolder + '/one');
            });
        });
    });
}(require('chai'), require('chai-as-promised'), require('dirty-chai'), require('bluebird'), require('../index'), require('fs'), require('extend')));
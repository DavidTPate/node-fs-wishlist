'use strict';
/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015-2016 Riptide Software Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const dirtyChai = require('dirty-chai');
const Promise = require('bluebird');
const lib = require('../index');
const fs = Promise.promisifyAll(require('fs'));
const extend = require('extend');
const helper = require('./helper');

chai.use(chaiAsPromised);
chai.use(dirtyChai);

const expect = chai.expect;
const testFolder = 'test/mock';
const mixedFs = lib.mixin(fs);

describe('#copyDir', () => {
    beforeEach(() => {
        return mixedFs.rmdirp(testFolder)
            .then(() => {
                return mixedFs.mkdirp(testFolder);
            });
    });
    it('should mixin copyDir by default', () => {
        expect(mixedFs).to.have.property('copyDir');
    });
    it('shouldn\'t mixin copyDir when already implemented', () => {
        const copyDirFunc = () => {
        };
        expect(lib.mixin(extend({}, fs, {copyDir: copyDirFunc})).copyDir).to.equal(copyDirFunc);
    });
    it('should mixin copyDir when included', () => {
        expect(lib.mixin(fs, {mixins: {copyDir: true}})).to.have.property('copyDir');
    });
    it('shouldn\'t mixin copyDir when excluded', () => {
        expect(lib.mixin(fs, {mixins: {copyDir: false}})).to.not.have.property('copyDir');
    });
    it('should be able to recursively copy directories', () => {
        return helper.createDirectories(fs, [
            testFolder + '/one',
            testFolder + '/one/two',
            testFolder + '/one/two/three',
            testFolder + '/one/two/three/four',
            testFolder + '/one/two/three/four/five'
        ]).then(() => {
            return Promise.all([
                fs.writeFileAsync(testFolder + '/one/2.txt', 'It can be very dangerous to see things from somebody else\'s point of view without the proper training.'),
                fs.writeFileAsync(testFolder + '/one/two/3.txt', 'He was a dreamer, a thinker, a speculative philosopher... or, as his wife would have it, an idiot.'),
                fs.writeFileAsync(testFolder + '/one/two/three/4.txt', 'See first, think later, then test. But always see first. Otherwise you will only see what you were expecting. Most scientists forget that.'),
                fs.writeFileAsync(testFolder + '/one/two/three/four/5.txt', 'One is never alone with a rubber duck.'),
                fs.writeFileAsync(testFolder + '/one/two/three/four/6.txt', 'Anything that thinks logically can be fooled by something else that thinks at least as logically as it does.')
            ]);
        }).then(() => {
            return mixedFs.copyDir(testFolder + '/one', testFolder + '/anotherOne');
        }).then(() => {
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
            ]).then((results) => {
                expect(results).to.deep.equal([true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]);
                return Promise.all([
                    helper.readFiles(fs,
                        [
                            testFolder + '/one/2.txt',
                            testFolder + '/one/two/3.txt',
                            testFolder + '/one/two/three/4.txt',
                            testFolder + '/one/two/three/four/5.txt',
                            testFolder + '/one/two/three/four/6.txt'
                        ]),
                    helper.readFiles(fs,
                        [
                            testFolder + '/anotherOne/2.txt',
                            testFolder + '/anotherOne/two/3.txt',
                            testFolder + '/anotherOne/two/three/4.txt',
                            testFolder + '/anotherOne/two/three/four/5.txt',
                            testFolder + '/anotherOne/two/three/four/6.txt'
                        ])
                ]).spread((originalFiles, copiedFiles) => {
                    for (let i = 0; i < originalFiles.length; i++) {
                        expect(originalFiles[i].toString()).to.equal(copiedFiles[i].toString());
                    }
                });
            });
        });
    });
    it('should be able to recursively copy directories with a callback', () => {
        return fs.mkdirAsync(testFolder + '/one').then(() => {
            return new Promise((resolve, reject) => {
                mixedFs.copyDir(testFolder + '/one', testFolder + '/anotherOne', (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        }).then(() => {
            return helper.pathsExist(fs, [
                testFolder + '/one',
                testFolder + '/anotherOne'
            ]).then((results) => {
                expect(results).to.deep.equal([true, true]);
            });
        });
    });
    it('shouldn\'t be able to copy a directory that is actually a file', () => {
        return fs.writeFileAsync(testFolder + '/one', 'I\'d far rather be happy than right anyday.').then(() => {
            return expect(mixedFs.copyDir(testFolder + '/one', testFolder + '/anotherOne')).to.eventually.be.rejectedWith(Error, /ENOTDIR/);
        });
    });
    it('shouldn\'t be able to copy a directory that doesn\'t exist', () => {
        return expect(mixedFs.copyDir(testFolder + '/one', testFolder + '/anotherOne')).to.eventually.be.rejectedWith(Error, /ENOENT/);
    });
    it('should propagate an error from a copyFile call', () => {
        const xfs = extend({}, mixedFs, {
            copyFile: (source, dest, cb) => {
                cb(new Error('Some Copy File Error'));
            }
        });
        return fs.mkdirAsync(testFolder + '/one').then(() => {
            return fs.writeFileAsync(testFolder + '/one/1.txt', 'In an infinite Universe anything can happen.');
        }).then(() => {
            return expect(xfs.copyDir(testFolder + '/one', testFolder + '/two')).to.eventually.be.rejectedWith(Error, 'Some Copy File Error');
        });
    });
    it('should propagate an error from a stats call', () => {
        const xfs = extend({}, mixedFs, {
            stat: (dir, cb) => {
                cb(new Error('Some Stats Error'));
            }
        });
        return fs.mkdirAsync(testFolder + '/one').then(() => {
            return fs.writeFileAsync(testFolder + '/one/1.txt', 'In an infinite Universe anything can happen.');
        }).then(() => {
            return expect(xfs.copyDir(testFolder + '/one')).to.eventually.be.rejectedWith(Error, 'Some Stats Error');
        });
    });
    it('should propagate an error from a mkdir call', () => {
        const xfs = extend({}, mixedFs, {
            mkdir: (dir, mode, cb) => {
                cb(new Error('Some Mkdir Error'));
            }
        });
        return fs.mkdirAsync(testFolder + '/one').then(() => {
            return expect(xfs.copyDir(testFolder + '/one', testFolder + '/anotherOne')).to.eventually.be.rejectedWith(Error, 'Some Mkdir Error');
        });
    });
});
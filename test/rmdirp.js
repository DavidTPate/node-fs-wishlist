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

describe('#rmdirp', () => {
    beforeEach(() => {
        return mixedFs.rmdirp(testFolder)
            .then(() => {
                return mixedFs.mkdirp(testFolder);
            });
    });
    it('should mixin rmdirp by default', () => {
        expect(lib.mixin(fs)).to.have.property('rmdirp');
    });
    it('shouldn\'t mixin rmdirp when already implemented', () => {
        const rmdirpFunc = () => {
        };
        expect(lib.mixin(extend({}, fs, {rmdirp: rmdirpFunc})).rmdirp).to.equal(rmdirpFunc);
    });
    it('should mixin rmdirp when included', () => {
        expect(lib.mixin(fs, {mixins: {rmdirp: true}})).to.have.property('rmdirp');
    });
    it('shouldn\'t mixin rmdirp when excluded', () => {
        expect(lib.mixin(fs, {mixins: {rmdirp: false}})).to.not.have.property('rmdirp');
    });
    it('should be able to recursively remove directories', () => {
        return helper.createDirectories(fs, [
            testFolder + '/one',
            testFolder + '/one/two',
            testFolder + '/one/two/three',
            testFolder + '/one/two/three/four',
            testFolder + '/one/two/three/four/five'
        ]).then(() => {
            return Promise.all([
                fs.writeFileAsync(testFolder + '/1.txt', 'The impossible often has a kind of integrity to it which the merely improbable lacks.'),
                fs.writeFileAsync(testFolder + '/one/2.txt', 'It can be very dangerous to see things from somebody else\'s point of view without the proper training.'),
                fs.writeFileAsync(testFolder + '/one/two/3.txt', 'He was a dreamer, a thinker, a speculative philosopher... or, as his wife would have it, an idiot.'),
                fs.writeFileAsync(testFolder + '/one/two/three/4.txt', 'See first, think later, then test. But always see first. Otherwise you will only see what you were expecting. Most scientists forget that.'),
                fs.writeFileAsync(testFolder + '/one/two/three/four/5.txt', 'One is never alone with a rubber duck.'),
                fs.writeFileAsync(testFolder + '/one/two/three/four/6.txt', 'Anything that thinks logically can be fooled by something else that thinks at least as logically as it does.')
            ]);
        }).then(() => {
            return lib.mixin(fs).rmdirp(testFolder + '/one');
        }).then(() => {
            return expect(helper.pathsExist(fs, [
                testFolder + '/1.txt',
                testFolder + '/one',
                testFolder + '/one/2.txt',
                testFolder + '/one/two',
                testFolder + '/one/two/3.txt',
                testFolder + '/one/two/three',
                testFolder + '/one/two/three/4.txt',
                testFolder + '/one/two/three/four',
                testFolder + '/one/two/three/four/5.txt',
                testFolder + '/one/two/three/four/6.txt',
                testFolder + '/one/two/three/four/five'
            ])).to.eventually.deep.equal([true, false, false, false, false, false, false, false, false, false, false]);
        });
    });
    it('should be able to recursively remove directories with a callback', () => {
        return fs.mkdirAsync(testFolder + '/one').then(() => {
            return new Promise((resolve, reject) => {
                lib.mixin(fs).rmdirp(testFolder + '/one', (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        }).then(() => {
            return expect(helper.pathsExist(fs, [testFolder + '/one'])).to.eventually.deep.equal([false]);
        });
    });
    it('shouldn\'t be able to remove a directory that already exists and isn\'t a directory', () => {
        return fs.writeFileAsync(testFolder + '/one', 'The ships hung in the sky in much the same way bricks don\'t.').then(() => {
            return expect(lib.mixin(fs).rmdirp(testFolder + '/one')).to.eventually.be.rejectedWith(Error, /ENOTDIR/);
        });
    });
    it('should be able to remove a directory that doesn\'t exist', () => {
        return expect(lib.mixin(fs).rmdirp(testFolder + '/one')).to.eventually.be.fulfilled();
    });
    it('should propagate an error from a stats call', () => {
        const xfs = extend({}, lib.mixin(fs), {
            stat: (dir, cb) => {
                cb(new Error('Some Stats Error'));
            }
        });
        return fs.mkdirAsync(testFolder + '/one')
            .then(() => {
                return fs.writeFileAsync(testFolder + '/one/1.txt', 'In an infinite Universe anything can happen.');
            }).then(() => {
                return expect(xfs.rmdirp(testFolder + '/one')).to.eventually.be.rejectedWith(Error, 'Some Stats Error');
            });
    });
    it('should propagate an error from an unlink call', () => {
        const xfs = extend({}, lib.mixin(fs), {
            unlink: (dir, cb) => {
                cb(new Error('Some Unlink Error'));
            }
        });
        return fs.mkdirAsync(testFolder + '/one')
            .then(() => {
                return fs.writeFileAsync(testFolder + '/one/1.txt', 'In an infinite Universe anything can happen.');
            }).then(() => {
                return expect(xfs.rmdirp(testFolder + '/one')).to.eventually.be.rejectedWith(Error, 'Some Unlink Error');
            });
    });
    it('should propagate an error from a rmdir call', () => {
        const xfs = extend({}, lib.mixin(fs), {
            rmdir: (dir, cb) => {
                cb(new Error('Some Rmdir Error'));
            }
        });
        return fs.mkdirAsync(testFolder + '/one').then(() => {
            return expect(xfs.rmdirp(testFolder + '/one')).to.eventually.be.rejectedWith(Error, 'Some Rmdir Error');
        });
    });
});
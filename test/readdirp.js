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

describe('#readdirp', () => {
    beforeEach(() => {
        return mixedFs.rmdirp(testFolder)
            .then(() => {
                return mixedFs.mkdirp(testFolder);
            });
    });
    it('should mixin readdirp by default', () => {
        expect(lib.mixin(fs)).to.have.property('readdirp');
    });
    it('shouldn\'t mixin readdirp when already implemented', () => {
        const readdirpFunc = () => {
        };
        expect(lib.mixin(extend({}, fs, {readdirp: readdirpFunc})).readdirp).to.equal(readdirpFunc);
    });
    it('should mixin readdirp when included', () => {
        expect(lib.mixin(fs, {mixins: {readdirp: true}})).to.have.property('readdirp');
    });
    it('shouldn\'t mixin readdirp when excluded', () => {
        expect(lib.mixin(fs, {mixins: {readdirp: false}})).to.not.have.property('readdirp');
    });
    it('should be able to recursively read directories', () => {
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
            return expect(lib.mixin(fs).readdirp(testFolder + '/one')).to.eventually.deep.equal([
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
            ]);
        });
    });
    it('should be able to recursively read directories with a callback', () => {
        return fs.mkdirAsync(testFolder + '/one').then(() => {
            return new Promise((resolve, reject) => {
                lib.mixin(fs).readdirp(testFolder + '/one', (err, files) => {
                    if (err) {
                        return reject(err);
                    }
                    expect(files).to.deep.equal([testFolder + '/one']);
                    resolve();
                });
            });
        });
    });
    it('shouldn\'t be able to read a directory that already exists and isn\'t a directory', () => {
        return fs.writeFileAsync(testFolder + '/one', 'The ships hung in the sky in much the same way bricks don\'t.').then(() => {
            return expect(lib.mixin(fs).readdirp(testFolder + '/one')).to.eventually.be.rejectedWith(Error, /ENOTDIR/);
        });
    });
    it('shouldn\'t be able to read a directory that doesn\'t exist', () => {
        return expect(lib.mixin(fs).readdirp(testFolder + '/one')).to.eventually.be.rejectedWith(Error, /ENOENT/);
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
                return expect(xfs.readdirp(testFolder + '/one')).to.eventually.be.rejectedWith(Error, 'Some Stats Error');
            });
    });
});
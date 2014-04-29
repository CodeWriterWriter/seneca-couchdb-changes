/* jshint unused: false */
/* global describe, it, before, beforeEach, after, afterEach */

var mocha = require('mocha');
var should = require('should');
var seneca = require('seneca')();
var _ = require('highland');


seneca.use('..');


describe('follow', function() {
    this.timeout(5000);
    it('initialized', function(done) {
        should(true).ok;
    });
});

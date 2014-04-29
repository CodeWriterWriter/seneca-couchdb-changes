/* jshint indent: 2, asi: true */
// vim: noai:ts=2:sw=2
/* global describe, it, before, beforeEach, after, afterEach */

var mocha = require('mocha');
var should = require('should');
var seneca = require('seneca')();
var _ = require('underscore');


seneca.use('..', {
  db: 'http://localhost:5984/registry'
});

seneca.add('role:couchdb,cmd:change,base:registry', function(data, next) {
  next(null, data);
});

describe('follow', function() {
  this.timeout(50);
  it('initialized', function(done) {
    should(true).ok;
  });
});

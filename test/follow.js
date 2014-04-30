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

before(seneca.ready.bind(seneca));
describe('follow', function() {
  seneca.add('role:couchdb,cmd:change,base:registry', function(data, next) {
    next(null, data);
  });


  it('initialized', function(done) {
    should(true).ok;
  });
});

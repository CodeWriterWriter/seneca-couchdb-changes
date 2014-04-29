/* jshint indent: 2, asi: true */
// vim: noai:ts=2:sw=2

var url    = require('url');
var assert = require('assert');
var follow = require('follow');
var _      = require('underscore');

var _name  = 'seneca-couchdb-changes';

function changes(opts, register) {
  var seneca = this;

  assert.ok(opts.db);

  _.defaults(opts, {
    entity : 'sequence',
    name   : url.parse(opts.db).path.replace(/^\//,'')
  });

  var couchOpts = {
    db: opts.db,
    include_docs: true
  };

  var _changes = follow(couchOpts);

  _changes.on('change', onChange);
  _changes.on('error', onError);

  _changes.follow();

  function onChange(data) {
    _changes.pause();

    var cmd = {
      role : 'couchdb',
      cmd  : 'change',
      base : opts.name,
      doc  : data.doc,
      id   : data._id,
      seq  : data.seq
    };

    seneca.act(cmd, function(err, args) {
      entityStore(data);
    });
  }

  function onError(error) {
    console.error(error);
  }

  function entityStore(data) {
    var seqEntity   = seneca.make(opts.entity);
    seqEntity.id    = opts.name;
    seqEntity.name  = opts.name;
    seqEntity.seqId = data.seq;

    seqEntity.save$(function(err, entity) {
      if (err) { console.log(err); }
      _changes.resume();
    });
  }

  register(null, {
    name: _name
  });
}

module.exports = changes;

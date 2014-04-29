/* jshint indent: 2, asi: true */
// vim: noai:ts=2:sw=2

var _ = require('underscore');
var follow = require('follow');

var _name  = 'seneca-couchdb-changes';

function changes(opts, register) {
  var seneca = this;

  _.defaults(opts, {
    db: 'http://localhost:5984/registry',
    seqenceEntity: 'sequence',
    sequenceName: 'registry'
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
      role: 'couchdb',
      cmd: 'change',
      base: opts.sequenceName,
      doc: data.doc,
      _id: data._id,
      _seq: data.seq,
      default$: {}
    };

    seneca.act(cmd);
    entityStore(data);
    _changes.resume();
  }

  function onError(error) {
    console.error(error);
  }

  function entityStore(data) {
    var seqEntity = seneca.make(opts.sequenceEntity);
    seqEntity.id = opts.sequenceName;
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

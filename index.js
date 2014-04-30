/* jshint indent: 2, asi: true */
// vim: noai:ts=2:sw=2

var url    = require('url');
var assert = require('assert');
var follow = require('follow');
var _      = require('underscore');

// just keep the name handy, so we don't dupe it.
var _name  = 'seneca-couchdb-changes';

// instantate a new seneca plugin.
// opts are passing in with seneca.use
// register is needed to set up plugin.
function changes(opts, register) {
  var seneca = this;
  var _changes = null;

  // we die early with seneca.
  // if it doesn't have a db string, just die.
  assert.ok(opts.db);

  // defaults for the main opts
  _.defaults(opts, {
    entity           : 'sequence',
    filter           : undefined,
    heartbeat        : undefined,
    inactivity_ms    : undefined,
    query_params     : undefined,
    name             : url.parse(opts.db).path.replace(/^\//,'')
  });

  // defaults for the couchdb follow
  // see: https://github.com/iriscouch/follow
  var couchOpts = {
    db              : opts.db,
    include_docs    : true,
    filter          : opts.filter,
    heartbeat       : opts.heartbeat,
    inactivity_ms   : opts.inactivity_ms,
    query_params    : opts.query_params
  };

  // create a new follow object.
  //
  // It also has a stream interface, but it
  // seems to be slightly non-standard.
  _changes = follow(couchOpts);

  // set up event handlers
  _changes.on('change', onChange);
  _changes.on('error', onError);

  // set up init event.
  // due to this, seneca won't start unless you
  // wrap it in seneca.ready on the consumer.

  seneca.add({init: _name}, init);
    
  function init(args, next) {
    // make a new copy of the entity type to load the sequence
    var seqEntity = seneca.make(opts.entity);

    seqEntity.load$({id: opts.name}, loadFn);

    function loadFn(err, entity) {
      if (err) { return seneca.fail(err); }

      // use the specified options, otherwise entity
      var since = opts.since || (entity && entity.since);

      if (since) {
        _changes.since = since;
      }
      _changes.follow();
      next();
    }
  }

  function onChange(data) {
    // pause the follow stream while we process
    // this new change
    _changes.pause();

    // create the seneca command we will fire
    var cmd = {
      role : 'couchdb',
      cmd  : 'change',
      base : opts.name,
      doc  : data.doc,
      id   : data._id,
      seq  : data.seq
    };

    // for each change, trigger a seneca event
    seneca.act(cmd, actFn);

    // followed by a sequence entity update.
    function actFn(err, args) {
      var seqEntity   = seneca.make(opts.entity);
      seqEntity.id    = opts.name;
      seqEntity.name  = opts.name;
      seqEntity.inc   = data.seq;

      seqEntity.save$(saveFn);
    }

    // result the follow stream when saved
    function saveFn(err, entity) {
      if (err) { return seneca.fail(err); }
      _changes.resume();
    }
  }

  function onError(err) {
    seneca.fail(err);
  }

  // register the plugin
  register(null, {
    name: _name
  });
}

module.exports = changes;

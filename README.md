# Project Status :
This plugin is not being supported by the seneca organization,  and is no longer proven to work.
If you are interested in maintaining this project, please contact us via the issue queue.
seneca-couchdb-changes
----------------------

This plugin will follow a couchdb changes feed and re-emit seneca events for them.

It only creates one entity, which is a representation of the 'since' parameter passed
to the feed. It will only emit the next item on every save of the since property.



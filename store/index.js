'use strict'
// database interface
module.exports = {
  setup: require('./setup'),
  actor: require('./actor'),
  object: require('./object'),
  stream: require('./stream'),
  connection: require('./connection')
}

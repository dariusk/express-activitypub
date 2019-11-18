'use strict'
const store = require('../store')
const federation = require('./federation')
const pubUtils = require('./utils')
module.exports = {
  resolveObject,
  resolve: resolveObject
}

// find object in local DB or fetch from origin server
async function resolveObject (id) {
  let object
  let parseCheck
  if (pubUtils.validateObject(id)) {
    // already an object
    object = id
  } else {
    // resolve id to local object
    try {
      // check if full IRI id or remote id
      parseCheck = new URL(id)
    } catch (ignore) {}
    if (!parseCheck) {
      // convert bare ObjectId to local IRI id
      id = pubUtils.objectIdToIRI(id)
    }
    object = await store.object.get(id)
    if (object) {
      return object
    }
    // resolve remote object from id
    object = await federation.requestObject(id)
  }
  // cache non-collection objects
  if (object.type !== 'Collection' && object.type !== 'OrderedCollection') {
    await store.object.save(object)
  }
  return object
}

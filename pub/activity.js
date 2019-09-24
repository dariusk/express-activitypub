'use strict'
const { ObjectId } = require('mongodb')
const store = require('../store')
const pubUtils = require('./utils')
const pubObject = require('./object')
const pubFederation = require('./federation')
module.exports = {
  address,
  addToOutbox,
  build
}

function build (type, actorId, object, to, cc, etc) {
  const oid = new ObjectId()
  const act = Object.assign({
    // _id: oid,
    id: pubUtils.actvityIdToIRI(oid),
    type,
    actor: actorId,
    object,
    to,
    cc,
    published: new Date().toISOString()
  }, etc)
  return act
}

async function address (activity) {
  let audience = []
  ;['to', 'bto', 'cc', 'bcc', 'audience'].forEach(t => {
    if (activity[t]) {
      audience = audience.concat(activity[t])
    }
  })
  audience = audience.map(t => {
    if (t === 'https://www.w3.org/ns/activitystreams#Public') {
      return null
    }
    return pubObject.resolveObject(t)
  })
  audience = await Promise.all(audience).then(addresses => {
    // TODO: spec says only deliver to actor-owned collections
    addresses = addresses.map(t => {
      if (t && t.inbox) {
        return t
      }
      if (t && t.items) {
        return t.items.map(pubObject.resolveObject)
      }
      if (t && t.orderedItems) {
        return t.orderedItems.map(pubObject.resolveObject)
      }
    })
    // flattens and resolves collections
    return Promise.all([].concat(...addresses))
  })
  audience = audience.filter(t => t && t.inbox)
    .map(t => t.inbox)
  // de-dupe
  return Array.from(new Set(audience))
}

function addToOutbox (actor, activity) {
  return Promise.all([
    // ensure object is cached, but don't alter representation in activity
    // so activities can be sent with objects as links
    pubObject.resolve(activity.object),
    store.stream.save(activity),
    address(activity).then(addresses => pubFederation.deliver(actor, activity, addresses))
  ])
}

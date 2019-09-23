'use strict'
const connection = require('./connection')
module.exports = async function dbSetup (domain, dummyUser) {
  const db = connection.getDb()
  // inbox
  await db.collection('streams').createIndex({
    '_meta._target': 1,
    _id: -1
  }, {
    name: 'inbox'
  })
  // followers
  await db.collection('streams').createIndex({
    '_meta._target': 1
  }, {
    partialFilterExpression: { type: 'Follow' },
    name: 'followers'
  })
  // outbox
  await db.collection('streams').createIndex({
    actor: 1,
    _id: -1
  })
  // object lookup
  await db.collection('objects').createIndex({
    id: 1
  })
  if (dummyUser) {
    return db.collection('objects').findOneAndReplace(
      { preferredUsername: 'dummy' },
      dummyUser,
      {
        upsert: true,
        returnOriginal: false
      }
    )
  }
}

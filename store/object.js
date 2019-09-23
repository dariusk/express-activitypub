'use strict'
const connection = require('./connection')
module.exports = {
  get,
  save
}

function get (id) {
  return connection.getDb()
    .collection('objects')
    .find({ id: id })
    .limit(1)
    .project({ _id: 0, _meta: 0 })
    .next()
}

async function save (object) {
  const db = connection.getDb()
  const exists = await db.collection('objects')
    .find({ id: object.id })
    .project({ _id: 1 })
    .limit(1)
    .hasNext()
  if (exists) {
    return false
  }
  return db.collection('objects')
    .insertOne(object, { forceServerObjectId: true })
}

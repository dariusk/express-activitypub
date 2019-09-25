'use strict'
const connection = require('./connection')
module.exports = {
  get,
  remove,
  save
}

function get (id) {
  const db = connection.getDb()
  return db.collection('streams')
    .find({ id: id })
    .limit(1)
    .project({ _id: 0, _meta: 0 })
    .next()
}

async function save (activity) {
  const db = connection.getDb()
  const q = { id: activity.id }
  // activities may be duplicated for multiple local targets
  if (activity._meta && activity._meta._target) {
    q['_meta._target'] = activity._meta._target
  }
  const exists = await db.collection('streams')
    .find(q)
    .project({ _id: 1 })
    .limit(1)
    .hasNext()
  if (exists) {
    return false
  }

  return db.collection('streams')
    // server object ID avoids mutating local copy of document
    .insertOne(activity, { forceServerObjectId: true })
}

function remove (activity, actor) {
  return connection.getDb().collection('streams')
    .deleteMany({ id: activity.id, actor: actor })
}

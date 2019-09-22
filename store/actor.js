'use strict'

module.exports = {
  getActor
}

const actorProj = { _id: 0, _meta: 0 }
const metaActorProj = { _id: 0 }

function getActor (id, db, includeMeta) {
  return db.collection('objects')
    .find({ id: id })
    .limit(1)
    // strict comparison as we don't want to return private keys on accident
    .project(includeMeta === true ? metaActorProj : actorProj)
    .next()
}

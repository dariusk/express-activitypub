'use strict'
const pub = require('../pub')
module.exports = {
    getActor,
    getOrCreateActor,
}

const actorProj = {_id: 0, _meta: 0}
const metaActorProj = {_id: 0}

function getActor (preferredUsername, db, includeMeta) {
    return db.collection('objects')
    .find({id: pub.utils.usernameToIRI(preferredUsername)})
    .limit(1)
    // strict comparison as we don't want to return private keys on accident
    .project(includeMeta === true ? metaActorProj : actorProj)
    .next()
}

async function getOrCreateActor(preferredUsername, db, includeMeta) {
    let user = await getActor(preferredUsername, db, includeMeta)
    if (user) {
        return user
    }
    // auto create groups whenever an unknown actor is referenced
    user = await pub.actor.createLocalActor(preferredUsername, 'Group')
    await db.collection('objects').insertOne(user)
    // only executed on success
    delete user._id
    if (includeMeta !== true) {
        delete user._meta
    }
    return user
}
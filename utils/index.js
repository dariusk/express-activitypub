const crypto = require('crypto')
const {promisify} = require('util')
const utils = require('../utils')
const config = require('../config.json')
const db = require('../db')
const pub = require('../pub')

module.exports.consts = require('./consts')

function isObject(value) {
    return value && typeof value === 'object' && value.constructor === Object
}
// outtermost closure starts the recursion counter
// const level = 0;
function traverseObject(obj, f) {
    const traverse = o => {
        // const level = level + 1
        // if (level > 5) return o
        traverseObject(o, f)
    }
    if (!isObject(obj)) return obj;
    Object.keys(obj).forEach(traverse)
    return f(obj);
}

const actorProj = {_id: 0, _meta: 0}
const metaActorProj = {_id: 0}
async function getOrCreateActor(preferredUsername, db, includeMeta) {
    const id = pub.utils.usernameToIRI(preferredUsername)
    let user = await db.collection('objects')
    .find({id: id})
    .limit(1)
    // strict comparison as we don't want to return private keys on accident
    .project(includeMeta === true ? metaActorProj : actorProj)
    .next()
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
module.exports.getOrCreateActor = getOrCreateActor
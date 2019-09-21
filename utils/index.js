const crypto = require('crypto')
const {promisify} = require('util')
const {ASContext} = require('./consts')
const config = require('../config.json')

module.exports.validators = require('./validators');

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
module.exports.toJSONLD = function (obj) {
    obj['@context'] = obj['@context'] || ASContext;
    return obj;
}

module.exports.arrayToCollection = function (arr, ordered) {

    return {
        '@context': ASContext,
        totalItems: arr.length,
        type: ordered ? 'orderedCollection' : 'collection',
        [ordered ? 'orderedItems' : 'items']: arr,
    }
}

function usernameToIRI (user) {
    return `https://${config.DOMAIN}/u/${user}`
}
module.exports.usernameToIRI = usernameToIRI

const generateKeyPairPromise = promisify(crypto.generateKeyPair)
function createLocalActor (name, type) {
    return generateKeyPairPromise('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        }
    }).then(pair => {
        const actorBase = usernameToIRI(name);
        return {
            _meta: {
                privateKey: pair.privateKey,
            },
            id: `${actorBase}`,
            "type": type,
            "following": `${actorBase}/following`,
            "followers": `${actorBase}/followers`,
            "liked": `${actorBase}/liked`,
            "inbox": `${actorBase}/inbox`,
            "outbox": `${actorBase}/outbox`,
            "preferredUsername": name,
            "name": "Dummy Person",
            "summary": "Gotta have someone in the db",
            "icon": `https://${config.DOMAIN}/f/${name}.png`,
            publicKey: {
                'id': `${actorBase}#main-key`,
                'owner': `${actorBase}`,
                'publicKeyPem': pair.publicKey
            },
        }
    })
}
module.exports.createLocalActor = createLocalActor
const actorProj = {_id: 0, _meta: 0}
const metaActorProj = {_id: 0}
async function getOrCreateActor(preferredUsername, db, includeMeta) {
    const id = usernameToIRI(preferredUsername)
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
    user = await createLocalActor(preferredUsername, 'Group')
    await db.collection('objects').insertOne(user)
    // only executed on success
    delete user._id
    if (includeMeta !== true) {
        delete user._meta
    }
    return user
}
module.exports.getOrCreateActor = getOrCreateActor

function actorFromActivity (activity) {
    if (Object.prototype.toString.call(activity.actor) === '[object String]') {
        return activity.actor
      }
      if (activity.actor.type === 'Link') {
        return activity.actor.href
      }
      return activity.actor.id
}
module.exports.actorFromActivity = actorFromActivity
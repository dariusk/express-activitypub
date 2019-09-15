const crypto = require('crypto')
const {promisify} = require('util')
const {ASContext} = require('./consts')
module.exports.validators = require('./validators');
const config = require('../config.json')

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

function userNameToIRI (user) {
    return `https://${config.DOMAIN}/u/${user}`
}
module.exports.userNameToIRI = userNameToIRI

const generateKeyPairPromise = promisify(crypto.generateKeyPair)
module.exports.createLocalActor = function (name, type) {
    return generateKeyPairPromise('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: config.KEYPASS
        }
    }).then(pair => {
        const actorBase = userNameToIRI(name);
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
            "icon": `http://${config.DOMAIN}/f/${name}.png`,
            attachment: [
            `http://${config.DOMAIN}/f/${name}.glb`
            ],
            publicKey: {
                'id': `${actorBase}#main-key`,
                'owner': `${actorBase}`,
                'publicKeyPem': pair.publicKey
            },
        }
    })
}

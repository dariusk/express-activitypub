const crypto = require('crypto')
const {promisify} = require('util')

const pubUtils = require('./utils')
const config = require('../config.json')

const generateKeyPairPromise = promisify(crypto.generateKeyPair)

module.exports = {
    createLocalActor
}

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
        const actorBase = pubUtils.usernameToIRI(name);
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

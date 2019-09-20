const utils = require('../utils')
const crypto = require('crypto')

module.exports = async function dbSetup (db, domain) {
    // inbox
    await db.collection('streams').createIndex({
        '_meta._target': 1,
        _id: -1,
    }, {
        name: 'inbox'
    })
    // followers
    await db.collection('streams').createIndex({
        '_meta._target': 1,
    }, {
        partialFilterExpression: {type: 'Follow'},
        name: 'followers'
    })
    // outbox
    await db.collection('streams').createIndex({
        actor: 1,
        _id: -1,
    })
    // object lookup
    await db.collection('objects').createIndex({
        id: 1
    })
    const dummyUser = await utils.createLocalActor('dummy', 'Person')
    await db.collection('objects').findOneAndReplace(
        {preferredUsername: 'dummy'},
        dummyUser,
        {
            upsert: true,
            returnOriginal: false,
        }
    )
}
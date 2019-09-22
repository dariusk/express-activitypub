'use strict'

module.exports = {
    get,
    save,
}

function get (id, db) {
    return db.collection('objects')
    .find({id: id})
    .limit(1)
    .project({_id: 0, _meta: 0})
    .next()
}

function save (object) {
    return db.collection('objects')
        .insertOne(object)
}
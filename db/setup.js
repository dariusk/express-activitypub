module.exports = function dbSetup (db, domain) {
    return db.collection('streams').createIndex({
        _target: 1,
        _id: -1,
    }).then(() => {
        return db.collection('objects').findOneAndReplace(
            {preferredUsername: 'dummy'},
            {
              id: `https://${domain}/u/dummy`,
              "type": "Person",
              "following": `https://${domain}/u/dummy/following`,
              "followers": `https://${domain}/u/dummy/followers`,
              "liked": `https://${domain}/u/dummy/liked`,
              "inbox": `https://${domain}/u/dummy/inbox`,
              "outbox": `https://${domain}/u/dummy/outbox`,
              "preferredUsername": "dummy",
              "name": "Dummy Person",
              "summary": "Gotta have someone in the db",
              "icon": `http://${domain}/f/dummy.png`,
              attachment: [
                `http://${domain}/f/dummy.glb`
              ]
            },
            {
              upsert: true,
              returnOriginal: false,
            }
          )
    })
}
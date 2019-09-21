'use strict';
const express = require('express'),
      router = express.Router();
const utils = require('../utils')
const pub = require('../pub')

router.get('/:name', async function (req, res) {
  let name = req.params.name;
  if (!name) {
    return res.status(400).send('Bad request.');
  }
  else {
    let db = req.app.get('db')
    const user = await utils.getOrCreateActor(name, db)
    if (user) {
      return res.json(pub.utils.toJSONLD(user))
    }
    return res.status(404).send('Person not found')
  }
});

router.get('/:name/followers', function (req, res) {
  let name = req.params.name;
  if (!name) {
    return res.status(400).send('Bad request.');
  }
  const db = req.app.get('db')
  db.collection('streams')
    .find({
      type: 'Follow',
      '_meta._target': pub.utils.usernameToIRI(name),
    })
    .project({_id: 0, actor: 1})
    .toArray()
    .then(follows => {
      const followers = follows.map(pub.utils.actorFromActivity)
      return res.json(pub.utils.arrayToCollection(followers))
    })
    .catch(err => {
      console.log(err)
      return res.status(500).send()
    })
});

module.exports = router;

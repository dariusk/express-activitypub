'use strict'
const express = require('express')
const router = express.Router()
const pub = require('../pub')
const net = require('../net')

router.get('/:name', net.validators.jsonld, function (req, res) {
  const name = req.params.name
  if (!name) {
    return res.status(400).send('Bad request.')
  }
  console.log('User json ', name)
  pub.actor.getOrCreateActor(name)
    .then(group => {
      return res.json(pub.utils.toJSONLD(group))
    })
    .catch(err => {
      console.log(err)
      res.status(500).send(`Error creating group ${name}`)
    })
})
// HTML version
router.get('/:name', function (req, res) {
  const name = req.params.name
  if (!name) {
    return res.status(400).send('Bad request.')
  }
  console.log('User html ', name)
  pub.actor.getOrCreateActor(name)
    .then(group => {
      const groupAcct = `${group.preferredUsername}@${req.app.get('domain')}`
      return res.render('group.html', { group, groupAcct })
    })
    .catch(err => {
      console.log(err)
      res.status(500).send(`Error creating group ${name}`)
    })
})

router.get('/:name/followers', net.validators.jsonld, function (req, res) {
  const name = req.params.name
  if (!name) {
    return res.status(400).send('Bad request.')
  }
  const db = req.app.get('db')
  db.collection('streams')
    .find({
      type: 'Follow',
      '_meta._target': pub.utils.usernameToIRI(name)
    })
    .project({ _id: 0, actor: 1 })
    .toArray()
    .then(follows => {
      const followers = follows.map(pub.utils.actorFromActivity)
      return res.json(pub.utils.arrayToCollection(followers))
    })
    .catch(err => {
      console.log(err)
      return res.status(500).send()
    })
})

module.exports = router

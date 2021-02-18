'use strict'
const express = require('express')
const router = express.Router()
const pub = require('../pub')
const net = require('../net')

// list active groups
router.get('/', net.validators.jsonld, function (req, res) {
  const db = req.app.get('db')
  db.collection('streams')
    .aggregate([
      { $sort: { _id: -1 } }, // start from most recent
      { $limit: 10000 }, // don't traverse the entire history
      { $match: { type: 'Announce' } },
      { $group: { _id: '$actor', postCount: { $sum: 1 } } },
      { $lookup: { from: 'objects', localField: '_id', foreignField: 'id', as: 'actor' } },
      // merge joined actor up
      { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$actor', 0] }, '$$ROOT'] } } },
      { $project: { _id: 0, _meta: 0, actor: 0 } }
    ])
    .sort({ postCount: -1 })
    .limit(Number.parseInt(req.query.n) || 50)
    .toArray()
    .then(groups => { console.log(JSON.stringify(groups)); return groups })
    .then(groups => res.json(groups))
    .catch(err => {
      console.log(err.message)
      return res.status(500).send()
    })
})

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
      console.log(err.message)
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
      console.log(err.message)
      return res.status(500).send()
    })
})

module.exports = router

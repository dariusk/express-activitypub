const express = require('express')
const router = express.Router()
const net = require('../net')
const pub = require('../pub')
const store = require('../store')

router.post('/', net.validators.outboxActivity, function (req, res) {
  store.actor.get(pub.utils.usernameToIRI(req.user), true)
    .then(actor => {
      return pub.activity.addToOutbox(actor, req.body)
    })
    .then(() => res.status(200).send())
    .catch(err => {
      console.log(err)
      res.status(500).send()
    })
})

router.get('/', function (req, res) {
  const db = req.app.get('db')
  db.collection('streams')
    .find({ actor: pub.utils.usernameToIRI(req.user) })
    .sort({ _id: -1 })
    .project({ _id: 0, _meta: 0, 'object._id': 0, 'object.@context': 0, 'object._meta': 0 })
    .toArray()
    .then(stream => res.json(pub.utils.arrayToCollection(stream, true)))
    .catch(err => {
      console.log(err)
      return res.status(500).send()
    })
})

module.exports = router

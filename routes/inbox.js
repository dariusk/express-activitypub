const express = require('express')
const router = express.Router()
const pub = require('../pub')
const net = require('../net')
const store = require('../store')

router.post('/', net.validators.activity, net.security.verifySignature, function (req, res) {
  req.body._meta = { _target: pub.utils.usernameToIRI(req.user) }
  // side effects
  switch (req.body.type) {
    case 'Accept':
      // TODO - side effect necessary for following collection?
      break
    case 'Follow':
      req.body._meta._target = req.body.object.id
      // send acceptance reply
      pub.actor.getOrCreateActor(req.user, true)
        .then(user => {
          const to = [pub.utils.actorFromActivity(req.body)]
          const accept = pub.activity.build('Accept', user.id, req.body.id, to)
          return pub.activity.addToOutbox(user, accept)
        })
        .catch(e => console.log(e))
      break
    case 'Create':
      pub.actor.getOrCreateActor(req.user, true)
        .then(user => {
          const to = [user.followers]
          const cc = [
            pub.utils.actorFromActivity(req.body),
            'https://www.w3.org/ns/activitystreams#Public'
          ]
          const accept = pub.activity.build('Announce', user.id, req.body.id, to, cc)
          return pub.activity.addToOutbox(user, accept)
        }).catch(e => console.log(e))
      break
  }
  Promise.all([
    pub.object.resolve(req.body.object),
    store.stream.save(req.body)
  ]).then(() => res.status(200).send())
    .catch(err => {
      console.log(err)
      res.status(500).send()
    })
})

router.get('/', function (req, res) {
  const db = req.app.get('db')
  db.collection('streams')
    .find({ '_meta._target': pub.utils.usernameToIRI(req.user) })
    .sort({ _id: -1 })
    .project({ _id: 0, _meta: 0, '@context': 0, 'object._id': 0, 'object.@context': 0, 'object._meta': 0 })
    .toArray()
    .then(stream => res.json(pub.utils.arrayToCollection(stream, true)))
    .catch(err => {
      console.log(err)
      return res.status(500).send()
    })
})

module.exports = router

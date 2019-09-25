const express = require('express')
const router = express.Router()
const pub = require('../pub')
const net = require('../net')
const store = require('../store')

router.post('/', net.validators.activity, net.security.verifySignature, function (req, res) {
  req.body._meta = { _target: pub.utils.usernameToIRI(req.user) }
  console.log(req.body)
  const toDo = {
    saveActivity: true,
    saveObject: false
  }
  // side effects
  switch (req.body.type) {
    case 'Accept':
      // TODO - side effect necessary for following collection?
      break
    case 'Follow':
      // TODO resolve object and ensure specified target matches inbox user
      // req.body._meta._target = req.body.object.id
      // send acceptance reply
      pub.actor.getOrCreateActor(req.user, true)
        .then(user => {
          const to = [pub.utils.actorFromActivity(req.body)]
          const accept = pub.activity.build('Accept', user.id, req.body, to)
          return pub.activity.addToOutbox(user, accept)
        })
        .catch(e => console.log(e))
      break
    case 'Create':
      toDo.saveObject = true
      pub.actor.getOrCreateActor(req.user, true)
        .then(user => {
          const to = [user.followers]
          const cc = [
            pub.utils.actorFromActivity(req.body),
            'https://www.w3.org/ns/activitystreams#Public'
          ]
          const announce = pub.activity.build('Announce', user.id, req.body.object.id, to, cc)
          return pub.activity.addToOutbox(user, announce)
        }).catch(e => console.log(e))
      break
    case 'Undo':
      pub.activity.undo(req.body.object, req.body.actor)
        .catch(err => console.log(err))
      break
  }
  const tasks = []
  if (toDo.saveObject) {
    tasks.push(pub.object.resolve(req.body.object))
  }
  if (toDo.saveActivity) {
    tasks.push(store.stream.save(req.body))
  }
  Promise.all(tasks).then(() => res.status(200).send())
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

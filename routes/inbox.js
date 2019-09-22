const express = require('express')
const router = express.Router()
const utils = require('../utils')
const pub = require('../pub')
const net = require('../net')
const store = require('../store')
const request = require('request-promise-native')
const httpSignature = require('http-signature')
const {ObjectId} = require('mongodb')

router.post('/', net.validators.activity, net.security.verifySignature, function (req, res) {
  const db = req.app.get('db');
  let outgoingResponse
  req.body._meta = {_target: pub.utils.usernameToIRI(req.user)}
  // side effects
  switch(req.body.type) {
    case 'Accept':
      // TODO - side effect ncessary for following collection?
      break
    case 'Follow':
      req.body._meta._target = req.body.object.id
      // send acceptance reply
      Promise.all([
        pub.actor.getOrCreateActor(req.user, db, true),
        pub.object.resolveObject(pub.utils.actorFromActivity(req.body), db),
      ])
        .then(([user, actor]) => {
          if (!actor || !actor.inbox) {
            throw new Error('unable to send follow request acceptance: actor inbox not retrievable')
          }
          const newID = new ObjectId()
          const responseOpts = {
            method: 'POST',
            url: actor.inbox,
            headers: {
              'Content-Type': 'application/activity+json',
            },
            httpSignature: {
              key: user._meta.privateKey,
              keyId: user.id,
              headers: ['(request-target)', 'host', 'date'],
            },
            json: true,
            body: pub.utils.toJSONLD({
              _id: newID,
              type: 'Accept',
              id: `https://${req.app.get('domain')}/o/${newID.toHexString()}`,
              actor: user.id,
              object: req.body,
            }),
          }
          return request(responseOpts)
        })
        .then(result => console.log('success', result))
        .catch(e => console.log(e))
      break
  }
  Promise.all([
    db.collection('objects').insertOne(req.body.object),
    db.collection('streams').insertOne(req.body)
  ]).then(() => res.status(200).send())
    .catch(err => {
      console.log(err)
      res.status(500).send()
    })
});

router.get('/', function (req, res) {
  const db = req.app.get('db');
  db.collection('streams')
    .find({'_meta._target': pub.utils.usernameToIRI(req.user)})
    .sort({_id: -1})
    .project({_id: 0, _meta: 0, '@context': 0, 'object._id': 0, 'object.@context': 0, 'object._meta': 0})
    .toArray()
    .then(stream => res.json(pub.utils.arrayToCollection(stream, true)))
    .catch(err => {
      console.log(err)
      return res.status(500).send()
    })
  ;
})

module.exports = router;

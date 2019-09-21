const express = require('express')
const router = express.Router()
const utils = require('../utils')
const pub = require('../pub')
const net = require('../net')
const request = require('request-promise-native')
const httpSignature = require('http-signature')
const {ObjectId} = require('mongodb')

router.post('/', net.validators.activity, function (req, res) {
  const db = req.app.get('db');
  let outgoingResponse
  req.body._meta = {_target: pub.utils.usernameToIRI(req.user)}
  // side effects
  switch(req.body.type) {
    case 'Accept':
      // workaround for node-http-signature#87
      const tempUrl = req.url
      req.url = req.originalUrl
      sigHead = httpSignature.parse(req, {clockSkew: 3000})
      req.url = tempUrl
      // TODO - real key lookup with remote fetch
      utils.getOrCreateActor(sigHead.keyId.replace(/.*\//, ''), db)
      .then(user => {
        const valid = httpSignature.verifySignature(sigHead, user.publicKey.publicKeyPem)
        console.log('key validation', valid)
        return res.status(valid ? 200 : 401).send()
      })
      break
    case 'Follow':
      req.body._meta._target = req.body.object.id
      // send acceptance reply
      Promise.all([
        utils.getOrCreateActor(req.user, db, true),
        request({
          url: pub.utils.actorFromActivity(req.body),
          headers: {Accept: 'application/activity+json'},
          json: true,
        })
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

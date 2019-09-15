const express = require('express')
const router = express.Router()
const utils = require('../utils')

router.post('/', utils.validators.outboxActivity, function (req, res) {
  const db = req.app.get('db');
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
    .find({actor: utils.userNameToIRI(req.user)})
    .sort({_id: -1})
    .project({_id: 0, _target: 0, 'object._id': 0, 'object.@context': 0})
    .toArray()
    .then(stream => res.json(utils.arrayToCollection(stream, true)))
    .catch(err => {
      console.log(err)
      return res.status(500).send()
    })
  ;
})

module.exports = router;

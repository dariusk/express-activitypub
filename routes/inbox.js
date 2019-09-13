const express = require('express'),
      router = express.Router();
const utils = require('../utils')

router.post('/', function (req, res) {
  const db = req.app.get('db');
  req.body._target = req.user
  delete req.body['@context']
  db.collection('streams').insertOne(req.body)
    .then(() => res.status(200).send())
    .catch(err => {
      console.log(err)
      res.status(500).send()
    })
});

router.get('/', async function (req, res) {
  const db = req.app.get('db');
  db.collection('streams')
    .find({_target: req.user})
    .sort({_id: -1})
    .project({_id: 0, _target: 0})
    .toArray()
    .then(stream => res.json(utils.arrayToCollection(stream, true)))
    .catch(err => {
      console.log(err)
      return res.status(500).send()
    })
  ;
})

module.exports = router;

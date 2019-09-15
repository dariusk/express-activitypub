'use strict';
const express = require('express'),
      router = express.Router();
const utils = require('../utils')
const acctReg = /acct:[@~]?([^@]+)@?(.*)/
router.get('/', function (req, res) {
  let resource = req.query.resource;
  let acct = acctReg.exec(resource)
  if (!acct || acct.length < 2) {
    return res.status(400).send('Bad request. Please make sure "acct:USER@DOMAIN" is what you are sending as the "resource" query parameter.');
  }
  if (acct[2] && acct[2].toLowerCase() !== req.app.get('domain').toLowerCase()) {
    return res.status(400).send('Requested user is not from this domain')
  }
  let db = req.app.get('db');
  const userId = utils.userNameToIRI(acct[1]);
  db.collection('objects')
    .find({id: userId})
    .limit(1)
    .project({_id: 0})
    .next()
    .then(result => {
      if (!result) {
        return res.status(404).send(`${acct[1]}@${acct[2]} not found`)
      }
      const finger = {
        'subject': resource,
        'links': [
          {
            'rel': 'self',
            'type': 'application/activity+json',
            'href': userId
          }
        ]
      }
      return res.json(finger)
    })
    .catch(err => {
      console.log(err);
      res.status(500).send()
    })
});

module.exports = router;

'use strict';
const express = require('express'),
      router = express.Router();

router.get('/', function (req, res) {
  let resource = req.query.resource;
  if (!resource || !resource.includes('acct:')) {
    return res.status(400).send('Bad request. Please make sure "acct:USER@DOMAIN" is what you are sending as the "resource" query parameter.');
  }
  else {
    let name = resource.replace('acct:','');
    let db = req.app.get('db');
    let result = db.prepare('select webfinger from accounts where name = ?').get(name);
    if (result === undefined) {
      return res.status(404).send(`No record found for ${name}.`);
    }
    else {
      res.json(JSON.parse(result.webfinger));
    }
  }
});

module.exports = router;

'use strict';
const express = require('express'),
      router = express.Router();

router.get('/:name', function (req, res) {
  let name = req.params.name;
  if (!name) {
    return res.status(400).send('Bad request.');
  }
  else {
    let db = req.app.get('db');
    let domain = req.app.get('domain');
    name = `${name}@${domain}`;
    db.get('select actor from accounts where name = $name', {$name: name}, (err, result) => {
      if (result === undefined) {
        return res.status(404).send(`No record found for ${name}.`);
      }
      else {
        res.json(JSON.parse(result.actor));
      }
    });
  }
});

module.exports = router;

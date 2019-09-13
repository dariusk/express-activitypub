'use strict';
const express = require('express'),
      router = express.Router();
// const inbox = require('./inbox');
const {toJSONLD} = require('../utils/index.js');

router.get('/:name', async function (req, res) {
  let name = req.params.name;
  if (!name) {
    return res.status(400).send('Bad request.');
  }
  else {
    let objs = req.app.get('objs');
    const id = `https://${req.app.get('domain')}/u/${name}`
    console.log(`looking up '${id}'`)
    const user = await objs.findOne({type: 'Person', id: id}, {fields: {_id: 0}})
      // .project({_id: 0})
    if (user) {
      return res.json(toJSONLD(user))
    }
    return res.status(404).send('Person not found')
  }
});

// router.get('/:name/followers', function (req, res) {
//   let name = req.params.name;
//   if (!name) {
//     return res.status(400).send('Bad request.');
//   }
//   else {
//     let db = req.app.get('db');
//     let domain = req.app.get('domain');
//     let result = db.prepare('select followers from accounts where name = ?').get(`${name}@${domain}`);
//     console.log(result);
//     result.followers = result.followers || '[]';
//     let followers = JSON.parse(result.followers);
//     let followersCollection = {
//       "type":"OrderedCollection",
//       "totalItems":followers.length,
//       "id":`https://${domain}/u/${name}/followers`,
//       "first": {
//         "type":"OrderedCollectionPage",
//         "totalItems":followers.length,
//         "partOf":`https://${domain}/u/${name}/followers`,
//         "orderedItems": followers,
//         "id":`https://${domain}/u/${name}/followers?page=1`
//       },
//       "@context":["https://www.w3.org/ns/activitystreams"]
//     };
//     res.json(toJSONLD(followersCollection));
//   }
// });

module.exports = router;

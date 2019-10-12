'use strict'
const express = require('express')
const router = express.Router()
const pub = require('../pub')

router.get('/:name', function (req, res) {
  const id = req.params.name
  if (!id) {
    return res.status(400).send('Bad request.')
  } else {
    // TODO: don't attempt to resolve remote ids if request is cross-origin
    // (to prevent abuse of guppe server to DDoS other servers)
    pub.object.resolve(id)
      .then(obj => {
        if (obj) {
          return res.json(pub.utils.toJSONLD(obj))
        }
        return res.status(404).send('Object not found')
      })
      .catch(err => {
        console.log(err.message)
        res.status(500).send()
      })
  }
})

module.exports = router

'use strict'
const express = require('express')
const router = express.Router()

const pub = require('../pub')
const acctReg = /acct:[@~]?([^@]+)@?(.*)/
router.get('/', function (req, res) {
  const resource = req.query.resource
  const acct = acctReg.exec(resource)
  if (!acct || acct.length < 2) {
    return res.status(400).send('Bad request. Please make sure "acct:USER@DOMAIN" is what you are sending as the "resource" query parameter.')
  }
  if (acct[2] && acct[2].toLowerCase() !== req.app.get('domain').toLowerCase()) {
    return res.status(400).send('Requested user is not from this domain')
  }
  const db = req.app.get('db')
  pub.actor.getOrCreateActor(acct[1], db)
    .then(result => {
      if (!result) {
        return res.status(404).send(`${acct[1]}@${acct[2]} not found`)
      }
      const finger = {
        subject: resource,
        links: [
          {
            rel: 'self',
            type: 'application/activity+json',
            href: result.id
          }
        ]
      }
      return res.json(finger)
    })
    .catch(err => {
      console.log(err.message)
      res.status(500).send()
    })
})

module.exports = router

'use strict'
const httpSignature = require('http-signature')
const pub = require('../pub')
// http communication middleware
module.exports = {
  auth,
  verifySignature
}

function auth (req, res, next) {
  // no client-to-server support at this time
  if (req.app.get('env') !== 'development') {
    return res.status(405).send()
  }
  next()
}

async function verifySignature (req, res, next) {
  try {
    if (!req.get('authorization') && !req.get('signature')) {
      // support for apps not using signature extension to ActivityPub
      const actor = await pub.object.resolveObject(pub.utils.actorFromActivity(req.body))
      if (actor.publicKey && req.app.get('env') !== 'development') {
        console.log('Missing http signature')
        return res.status(400).send('Missing http signature')
      }
      return next()
    }
    const sigHead = httpSignature.parse(req)
    const signer = await pub.object.resolveObject(sigHead.keyId, req.app.get('db'))
    const valid = httpSignature.verifySignature(sigHead, signer.publicKey.publicKeyPem)
    if (!valid) {
      console.log('signature validation failure', sigHead.keyId)
      return res.status(400).send('Invalid http signature')
    }
    next()
  } catch (err) {
    console.log('error during signature verification', err.message)
    return res.status(500).send()
  }
}

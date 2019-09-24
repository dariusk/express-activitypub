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
  if (!req.get('authorization')) {
    // support for apps not using signature extension to ActivityPub
    const actor = await pub.object.resolveObject(pub.utils.actorFromActivity(req.body))
    if (actor.publicKey && req.app.get('env') !== 'development') {
      return res.status(400).send('Missing http signature')
    }
    return next()
  }
  // workaround for node-http-signature#87
  const tempUrl = req.url
  req.url = req.originalUrl
  const sigHead = httpSignature.parse(req)
  req.url = tempUrl
  const signer = await pub.object.resolveObject(sigHead.keyId, req.app.get('db'))
  const valid = httpSignature.verifySignature(sigHead, signer.publicKey.publicKeyPem)
  console.log('signature validation', valid)
  if (!valid) {
    return res.status(400).send('Invalid http signature')
  }
  next()
}

'use strict'
const httpSignature = require('http-signature')
const pub = require('../pub')
// http communication middleware
module.exports = {
  verifySignature
}

async function verifySignature (req, res, next) {
  if (!req.get('authorization')) {
    // support for apps not using signature extension to ActivityPub
    // TODO check if actor has a publicKey and require signature
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

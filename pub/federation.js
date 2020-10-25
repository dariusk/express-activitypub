'use strict'
const crypto = require('crypto')
const request = require('request-promise-native')
const pubUtils = require('./utils')

// federation communication utilities
module.exports = {
  requestObject,
  deliver
}

function requestObject (id) {
  return request({
    url: id,
    headers: { Accept: 'application/activity+json' },
    httpSignature: {
      key: global.guppeSystemUser._meta.privateKey,
      keyId: global.guppeSystemUser.id,
      headers: ['(request-target)', 'host', 'date'],
      authorizationHeaderName: 'Signature'
    }
  })
}

function deliver (actor, activity, addresses) {
  if (activity.bto) {
    delete activity.bto
  }
  if (activity.bcc) {
    delete activity.bcc
  }
  const requests = addresses.map(addr => {
    const body = pubUtils.toJSONLD(activity)
    const digest = crypto.createHash('sha256')
      .update(JSON.stringify(body))
      .digest('base64')
    return request({
      method: 'POST',
      url: addr,
      headers: {
        'Content-Type': 'application/activity+json',
        Digest: `SHA-256=${digest}`
      },
      httpSignature: {
        key: actor._meta.privateKey,
        keyId: actor.id,
        headers: ['(request-target)', 'host', 'date', 'digest'],
        authorizationHeaderName: 'Signature'
      },
      json: true,
      resolveWithFullResponse: true,
      simple: false,
      body
    })
      .then(result => console.log('delivery:', addr, result.statusCode))
      .catch(err => console.log(err.message))
  })
  return Promise.all(requests)
}

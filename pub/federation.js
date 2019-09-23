'use strict'
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
    json: true
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
    return request({
      method: 'POST',
      url: addr,
      headers: {
        'Content-Type': 'application/activity+json'
      },
      httpSignature: {
        key: actor._meta.privateKey,
        keyId: actor.id,
        headers: ['(request-target)', 'host', 'date']
      },
      json: true,
      body: pubUtils.toJSONLD(activity)
    })
  })
  return Promise.all(requests)
}

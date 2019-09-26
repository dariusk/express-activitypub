'use strict'
const config = require('../config.json')
const pubConsts = require('./consts')

module.exports = {
  actvityIdToIRI,
  usernameToIRI,
  toJSONLD,
  arrayToCollection,
  actorFromActivity,
  objectIdToIRI,
  validateActivity,
  validateObject
}

function actorFromActivity (activity) {
  if (Object.prototype.toString.call(activity.actor) === '[object String]') {
    return activity.actor
  }
  if (activity.actor.type === 'Link') {
    return activity.actor.href
  }
  return activity.actor.id
}

function arrayToCollection (arr, ordered) {
  return {
    '@context': pubConsts.ASContext,
    totalItems: arr.length,
    type: ordered ? 'orderedCollection' : 'collection',
    [ordered ? 'orderedItems' : 'items']: arr
  }
}

function toJSONLD (obj) {
  obj['@context'] = obj['@context'] || pubConsts.ASContext
  return obj
}

function usernameToIRI (user) {
  return `https://${config.DOMAIN}/u/${user}`.toLowerCase()
}

function objectIdToIRI (oid) {
  if (oid.toHexString) {
    oid = oid.toHexString()
  }
  return `https://${config.DOMAIN}/o/${oid}`.toLowerCase()
}

function actvityIdToIRI (oid) {
  if (oid.toHexString) {
    oid = oid.toHexString()
  }
  return `https://${config.DOMAIN}/s/${oid}`.toLowerCase()
}

function validateObject (object) {
  if (object && object.id) {
    // object['@context'] = object['@context'] || pubConsts.ASContext
    return true
  }
}

function validateActivity (object) {
  if (object && object.id && object.actor) {
    return true
  }
}

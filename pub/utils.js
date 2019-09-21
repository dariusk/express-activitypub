'use strict'
const config = require('../config.json')
const consts = require('./consts')

module.exports = {
    usernameToIRI,
    toJSONLD,
    arrayToCollection,
    actorFromActivity,
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
        '@context': consts.ASContext,
        totalItems: arr.length,
        type: ordered ? 'orderedCollection' : 'collection',
        [ordered ? 'orderedItems' : 'items']: arr,
    }
}

function toJSONLD (obj) {
    obj['@context'] = obj['@context'] || consts.ASContext;
    return obj;
}

function usernameToIRI (user) {
    return `https://${config.DOMAIN}/u/${user}`
}

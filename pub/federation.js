'use strict'
const request = require('request-promise-native')

// federation communication utilities
module.exports = {
    requestObject,
}

function requestObject (id) {
    return request({
        url: id,
        headers: {Accept: 'application/activity+json'},
        json: true,
      })
}
'use strict'
module.exports = (function () {
  let con
  return {
    setDb: db => { con = db },
    getDb: () => con
  }
})()

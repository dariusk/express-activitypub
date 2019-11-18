const pub = require('../pub')

module.exports = {
  activity,
  jsonld,
  outboxActivity
}

function activity (req, res, next) {
  if (!pub.utils.validateActivity(req.body)) {
    return res.status(400).send('Invalid activity')
  }
  next()
}

function jsonld (req, res, next) {
  // we don't have to rule out HTML/browsers
  // because history fallback catches them first
  if (req.method === 'GET' && req.accepts(pub.consts.jsonldTypes)) {
    return next()
  }
  if (req.method === 'POST' && req.is(pub.consts.jsonldTypes)) {
    return next()
  }
  next('route')
}

function outboxActivity (req, res, next) {
  if (!pub.utils.validateActivity(req.body)) {
    if (!pub.utils.validateObject(req.body)) {
      return res.status(400).send('Invalid activity')
    }
    const actor = pub.utils.usernameToIRI(req.user)
    const extras = {}
    if (req.body.bcc) {
      extras.bcc = req.body.bcc
    }
    if (req.body.audience) {
      extras.audience = req.body.audience
    }
    req.body = pub.activity
      .build('Create', actor, req.body, req.body.to, req.body.cc, extras)
  }
  next()
}

const pub = require('../pub')

module.exports.activity = function activity (req, res, next) {
  if (!pub.utils.validateActivity(req.body)) {
    return res.status(400).send('Invalid activity')
  }
  next()
}

module.exports.outboxActivity = function outboxActivity (req, res, next) {
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

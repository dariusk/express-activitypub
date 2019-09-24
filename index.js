const path = require('path')
const express = require('express')
const MongoClient = require('mongodb').MongoClient
const fs = require('fs')
const bodyParser = require('body-parser')
const cors = require('cors')
const https = require('https')

const routes = require('./routes')
const pub = require('./pub')
const store = require('./store')
const { DOMAIN, KEY_PATH, CERT_PATH, PORT, PORT_HTTPS, DB_URL, DB_NAME } = require('./config.json')

const app = express()
const client = new MongoClient(DB_URL, { useUnifiedTopology: true, useNewUrlParser: true })

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, KEY_PATH)),
  cert: fs.readFileSync(path.join(__dirname, CERT_PATH))
}

app.set('domain', DOMAIN)
app.set('port', process.env.PORT || PORT)
app.set('port-https', process.env.PORT_HTTPS || PORT_HTTPS)
app.use(bodyParser.json({
  type: [
    'application/activity+json',
    'application/ld+json; profile="https://www.w3.org/ns/activitystreams"'
  ]
})) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

app.param('name', function (req, res, next, id) {
  req.user = id
  next()
})

// admin page
app.use('/.well-known/webfinger', cors(), routes.webfinger)
app.use('/u', cors(), routes.user)
app.use('/o', cors(), routes.object)

// admin page
app.use('/.well-known/webfinger', cors(), routes.webfinger)
app.use('/u', cors(), routes.user)
app.use('/o', cors(), routes.object)
app.use('/s', cors(), routes.stream)
app.use('/u/:name/inbox', routes.inbox)
app.use('/u/:name/outbox', routes.outbox)
app.use('/', express.static('public/www'))
app.use('/f', express.static('public/files'))

client.connect({ useNewUrlParser: true })
  .then(() => {
    console.log('Connected successfully to db')
    const db = client.db(DB_NAME)
    app.set('db', db)
    store.connection.setDb(db)
    return pub.actor.createLocalActor('dummy', 'Person')
  })
  .then(dummy => {
    return store.setup(DOMAIN, dummy)
  })
  .then(() => {
    https.createServer(sslOptions, app).listen(app.get('port-https'), function () {
      console.log('Express server listening on port ' + app.get('port-https'))
    })
  })
  .catch(err => {
    throw new Error(err)
  })

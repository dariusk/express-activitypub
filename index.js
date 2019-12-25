const path = require('path')
const express = require('express')
const MongoClient = require('mongodb').MongoClient
const fs = require('fs')
const bodyParser = require('body-parser')
const cors = require('cors')
const https = require('https')
const morgan = require('morgan')
const history = require('connect-history-api-fallback')

const routes = require('./routes')
const pub = require('./pub')
const store = require('./store')
const net = require('./net')
const { DOMAIN, KEY_PATH, CERT_PATH, CA_PATH, PORT, PORT_HTTPS, DB_URL, DB_NAME } = require('./config.json')

const app = express()

const client = new MongoClient(DB_URL, { useUnifiedTopology: true, useNewUrlParser: true })

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, KEY_PATH)),
  cert: fs.readFileSync(path.join(__dirname, CERT_PATH)),
  ca: CA_PATH ? fs.readFileSync(path.join(__dirname, CA_PATH)) : undefined
}

app.set('domain', DOMAIN)
app.set('port', process.env.PORT || PORT)
app.set('port-https', process.env.PORT_HTTPS || PORT_HTTPS)
app.use(morgan('combined'))
app.use(history({
  index: '/web/index.html',
  rewrites: [
    // do not redirect webfinger et c.
    { from: /^\/\.well-known\//, to: context => context.request.originalUrl }
  ]
}))
app.use(bodyParser.json({
  type: pub.consts.jsonldTypes
})) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

app.param('name', function (req, res, next, id) {
  req.user = id
  next()
})

// json only routes
app.use('/.well-known/webfinger', cors(), routes.webfinger)
app.use('/o', net.validators.jsonld, cors(), routes.object)
app.use('/s', net.validators.jsonld, cors(), routes.stream)
app.use('/u/:name/inbox', net.validators.jsonld, routes.inbox)
app.use('/u/:name/outbox', net.validators.jsonld, routes.outbox)
app.use('/u', cors(), routes.user)

// html/static routes
app.use('/f', express.static('public/files'))
app.use('/web', express.static('web/dist'))

// error logging
app.use(function (err, req, res, next) {
  console.error(err.message, req.body, err.stack)
  res.status(500).send('An error occurred while processing the request')
})

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

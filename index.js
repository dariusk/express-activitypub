const path = require('path')
const express = require('express')
const MongoClient = require('mongodb').MongoClient
const fs = require('fs')
const bodyParser = require('body-parser')
const cors = require('cors')
const https = require('https')
const nunjucks = require('nunjucks')

const routes = require('./routes')
const pub = require('./pub')
const store = require('./store')
const net = require('./net')
const { DOMAIN, KEY_PATH, CERT_PATH, CA_PATH, PORT, PORT_HTTPS, DB_URL, DB_NAME } = require('./config.json')

const app = express()
nunjucks.configure('templates', {
  autoescape: true,
  express: app,
  watch: app.get('env') === 'development'
})

const client = new MongoClient(DB_URL, { useUnifiedTopology: true, useNewUrlParser: true })

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, KEY_PATH)),
  cert: fs.readFileSync(path.join(__dirname, CERT_PATH)),
  ca: CA_PATH ? fs.readFileSync(path.join(__dirname, CA_PATH)) : undefined
}

app.set('domain', DOMAIN)
app.set('port', process.env.PORT || PORT)
app.set('port-https', process.env.PORT_HTTPS || PORT_HTTPS)
app.use(bodyParser.json({
  type: pub.consts.jsonldTypes
})) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

app.param('name', function (req, res, next, id) {
  req.user = id
  next()
})

// json only routes
app.use('/.well-known/webfinger', net.validators.jsonld, cors(), routes.webfinger)
app.use('/o', net.validators.jsonld, cors(), routes.object)
app.use('/s', net.validators.jsonld, cors(), routes.stream)
app.use('/u/:name/inbox', net.validators.jsonld, routes.inbox)
app.use('/u/:name/outbox', net.validators.jsonld, routes.outbox)

// dual use routes
app.use('/u', cors(), routes.user)

// html/static routes
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

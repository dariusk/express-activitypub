const { promisify } = require('util')
const path = require('path')
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const routes = require('./routes')
const bodyParser = require('body-parser')
const cors = require('cors')
const http = require('http')
const https = require('https')
const basicAuth = require('express-basic-auth');

const config = require('./config.json');
const { USER, PASS, DOMAIN, KEY_PATH, CERT_PATH, PORT, PORT_HTTPS } = config;

const app = express();
// Connection URL
const url = 'mongodb://localhost:27017';

const dbSetup = require('./db/setup');
// Database Name
const dbName = 'test';

// Create a new MongoClient
const client = new MongoClient(url, {useUnifiedTopology: true});

let db;


let sslOptions;

  sslOptions = {
    key: fs.readFileSync(path.join(__dirname, KEY_PATH)),
    cert: fs.readFileSync(path.join(__dirname, CERT_PATH))
  };


app.set('domain', DOMAIN);
app.set('port', process.env.PORT || PORT);
app.set('port-https', process.env.PORT_HTTPS || PORT_HTTPS);
app.use(bodyParser.json({type: [
  'application/activity+json',
  'application/ld+json; profile="https://www.w3.org/ns/activitystreams"'
]})); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// basic http authorizer
let basicUserAuth = basicAuth({
  authorizer: asyncAuthorizer,
  authorizeAsync: true,
  challenge: true
});

function asyncAuthorizer(username, password, cb) {
  let isAuthorized = false;
  const isPasswordAuthorized = username === USER;
  const isUsernameAuthorized = password === PASS;
  isAuthorized = isPasswordAuthorized && isUsernameAuthorized;
  if (isAuthorized) {
    return cb(null, true);
  }
  else {
    return cb(null, false);
  }
}

app.param('name', function (req, res, next, id) {
  req.user = id
  next()
})

app.get('/', (req, res) => res.send('Hello World!'));

// admin page
app.options('/api', cors());
app.use('/api', cors(), routes.api);
app.use('/api/admin', cors({ credentials: true, origin: true }), basicUserAuth, routes.admin);
app.use('/.well-known/webfinger', cors(), routes.webfinger);
app.use('/u', cors(), routes.user);
app.use('/m', cors(), routes.message);
app.use('/u/:name/inbox', routes.inbox)
app.use('/u/:name/outbox', routes.outbox)
app.use('/admin', express.static('public/admin'));
app.use('/f', express.static('public/files'));
// app.use('/hubs', express.static('../hubs/dist'));

// Use connect method to connect to the Server
client.connect({useNewUrlParser: true})
  .then(() => {
    console.log("Connected successfully to server");
    db = client.db(dbName);
    app.set('db', db);
    return dbSetup(db, DOMAIN)
  })
  .then(() => {
    https.createServer(sslOptions, app).listen(app.get('port-https'), function () {
      console.log('Express server listening on port ' + app.get('port-https'));
    });
  })
  .catch(err => {
    throw new Error(err)
  });

const { promisify } = require('util')
const config = require('./config.json');
const { USER, PASS, DOMAIN, PRIVKEY_PATH, CERT_PATH, PORT } = config;
const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
// Connection URL
const url = 'mongodb://localhost:27017';

const dbSetup = require('./db/setup');
// Database Name
const dbName = 'test';

// Create a new MongoClient
const client = new MongoClient(url, {useUnifiedTopology: true});

let db;

const fs = require('fs');
const routes = require('./routes'),
      bodyParser = require('body-parser'),
      cors = require('cors'),
      http = require('http'),
      https = require('https'),
      basicAuth = require('express-basic-auth');
let sslOptions;

try {
  sslOptions = {
    key: fs.readFileSync(PRIVKEY_PATH),
    cert: fs.readFileSync(CERT_PATH)
  };
} catch(err) {
  if (err.errno === -2) {
    console.log('No SSL key and/or cert found, not enabling https server');
  }
  else {
    console.log(err);
  }
}

app.set('domain', DOMAIN);
app.set('port', process.env.PORT || PORT || 3000);
app.set('port-https', process.env.PORT_HTTPS || 8443);
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
// app.use('/api/inbox', cors(), routes.inbox);
app.use('/u/:name/inbox', routes.inbox);
app.use('/admin', express.static('public/admin'));
app.use('/f', express.static('public/files'));
app.use('/hubs', express.static('../hubs/dist'));

// Use connect method to connect to the Server
let objs
client.connect({useNewUrlParser: true})
  .then(() => {
    console.log("Connected successfully to server");
    db = client.db(dbName);
    app.set('db', db);
    objs = db.collection('objects');
    app.set('objs', db.collection('objects'));

    return dbSetup(db, DOMAIN)
  })

  .then(() => {
    http.createServer(app).listen(app.get('port'), function(){
      console.log('Express server listening on port ' + app.get('port'));
    });
    if (sslOptions) {
      https.createServer(sslOptions, app).listen(app.get('port-https'), function () {
        console.log('Express server listening on port ' + app.get('port-https'));
      });
    }
  })
  .catch(err => {
    throw new Error(err)
  });

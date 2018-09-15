const config = require('./config.json');
const { USER, PASS, DOMAIN, PRIVKEY_PATH, CERT_PATH, PORT } = config;
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('bot-node.db');
const fs = require('fs');
const routes = require('./routes'),
      bodyParser = require('body-parser'),
      cors = require('cors'),
      http = require('http'),
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

// if there is no `accounts` table in the DB, create an empty table
db.run('CREATE TABLE IF NOT EXISTS accounts (name TEXT PRIMARY KEY, privkey TEXT, pubkey TEXT, webfinger TEXT, actor TEXT, apikey TEXT, followers TEXT, messages TEXT)');

app.set('db', db);
app.set('domain', DOMAIN);
app.set('port', process.env.PORT || PORT || 3000);
app.set('port-https', process.env.PORT_HTTPS || 8443);
app.use(bodyParser.json({type: 'application/activity+json'})); // support json encoded bodies
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

app.get('/', (req, res) => res.send('Hello World!'));

// admin page
app.options('/api', cors());
app.use('/api', cors(), routes.api);
app.use('/api/admin', cors({ credentials: true, origin: true }), basicUserAuth, routes.admin);
app.use('/admin', express.static('public/admin'));
app.use('/.well-known/webfinger', cors(), routes.webfinger);
app.use('/u', cors(), routes.user);
app.use('/api/inbox', cors(), routes.inbox);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

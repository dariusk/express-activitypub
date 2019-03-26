'use strict';
const express = require('express'),
      router = express.Router(),
      crypto = require('crypto'),
      generateRSAKeypair = require('generate-rsa-keypair');

function createActor(name, domain, pubkey) {
  return {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://w3id.org/security/v1'
    ],

    'id': `https://${domain}/u/${name}`,
    'type': 'Person',
    'preferredUsername': `${name}`,
    'inbox': `https://${domain}/api/inbox`,
    'followers': `https://${domain}/u/${name}/followers`,

    'publicKey': {
      'id': `https://${domain}/u/${name}#main-key`,
      'owner': `https://${domain}/u/${name}`,
      'publicKeyPem': pubkey
    }
  };
}

function createWebfinger(name, domain) {
  return {
    'subject': `acct:${name}@${domain}`,

    'links': [
      {
        'rel': 'self',
        'type': 'application/activity+json',
        'href': `https://${domain}/u/${name}`
      }
    ]
  };
}

router.post('/create', function (req, res) {
  // pass in a name for an account, if the account doesn't exist, create it!
  const account = req.body.account;
  if (account === undefined) {
    return res.status(400).json({msg: 'Bad request. Please make sure "account" is a property in the POST body.'});
  }
  let db = req.app.get('db');
  let domain = req.app.get('domain');
  // create keypair
  var pair = generateRSAKeypair();
  let actorRecord = createActor(account, domain, pair.public);
  let webfingerRecord = createWebfinger(account, domain);
  const apikey = crypto.randomBytes(16).toString('hex');
  try {
    db.prepare('insert or replace into accounts(name, actor, apikey, pubkey, privkey, webfinger) values(?, ?, ?, ?, ?, ?)').run(`${account}@${domain}`, JSON.stringify(actorRecord), apikey, pair.public, pair.private, JSON.stringify(webfingerRecord));
    res.status(200).json({msg: 'ok', apikey});
  }
  catch(e) {
    res.status(200).json({error: e});
  }
});

module.exports = router;

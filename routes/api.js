'use strict';
const express = require('express'),
      router = express.Router(),
      request = require('request'),
      crypto = require('crypto');

router.post('/sendMessage', function (req, res) {
  let db = req.app.get('db');
  let domain = req.app.get('domain');
  let acct = req.body.acct;
  let apikey = req.body.apikey;
  let message = req.body.message;
  // check to see if your API key matches
  let result = db.prepare('select apikey from accounts where name = ?').get(`${acct}@${domain}`);
  if (result.apikey === apikey) {
    sendCreateMessage(message, acct, domain, req, res);
  }
  else {
    res.status(403).json({msg: 'wrong api key'});
  }
});

function signAndSend(message, name, domain, req, res, targetDomain, inbox) {
  // get the private key
  let db = req.app.get('db');
  let inboxFragment = inbox.replace('https://'+targetDomain,'');
  let result = db.prepare('select privkey from accounts where name = ?').get(`${name}@${domain}`);
  if (result === undefined) {
    console.log(`No record found for ${name}.`);
  }
  else {
    let privkey = result.privkey;
    const signer = crypto.createSign('sha256');
    let d = new Date();
    let stringToSign = `(request-target): post ${inboxFragment}\nhost: ${targetDomain}\ndate: ${d.toUTCString()}`;
    signer.update(stringToSign);
    signer.end();
    const signature = signer.sign(privkey);
    const signature_b64 = signature.toString('base64');
    let header = `keyId="https://${domain}/u/${name}",headers="(request-target) host date",signature="${signature_b64}"`;
    request({
      url: inbox,
      headers: {
        'Host': targetDomain,
        'Date': d.toUTCString(),
        'Signature': header
      },
      method: 'POST',
      json: true,
      body: message
    }, function (error, response){
      console.log(`Sent message to an inbox at ${targetDomain}!`);
      if (error) {
        console.log('Error:', error, response);
      }
      else {
        console.log('Response Status Code:', response.statusCode);
      }
    });
  }
}

function createMessage(text, name, domain, req, res) {
  const guidCreate = crypto.randomBytes(16).toString('hex');
  const guidNote = crypto.randomBytes(16).toString('hex');
  let db = req.app.get('db');
  let d = new Date();

  let noteMessage = {
    'id': `https://${domain}/m/${guidNote}`,
    'type': 'Note',
    'published': d.toISOString(),
    'attributedTo': `https://${domain}/u/${name}`,
    'content': text,
    'to': 'https://www.w3.org/ns/activitystreams#Public'
  };

  let createMessage = {
    '@context': 'https://www.w3.org/ns/activitystreams',

    'id': `https://${domain}/m/${guidCreate}`,
    'type': 'Create',
    'actor': `https://${domain}/u/${name}`,

    'object': noteMessage
  };

  db.prepare('insert or replace into messages(guid, message) values(?, ?)').run( guidCreate, JSON.stringify(createMessage));
  db.prepare('insert or replace into messages(guid, message) values(?, ?)').run( guidNote, JSON.stringify(noteMessage));

  return createMessage;
}

function sendCreateMessage(text, name, domain, req, res) {
  let message = createMessage(text, name, domain, req, res);
  let db = req.app.get('db');

  let result = db.prepare('select followers from accounts where name = ?').get(`${name}@${domain}`);
  let followers = JSON.parse(result.followers);
  console.log(followers);
  console.log('type',typeof followers);
  if (followers === null) {
    console.log('aaaa');
    res.status(400).json({msg: `No followers for account ${name}@${domain}`});
  }
  else {
    for (let follower of followers) {
      let inbox = follower+'/inbox';
      let myURL = new URL(follower);
      let targetDomain = myURL.hostname;
      signAndSend(message, name, domain, req, res, targetDomain, inbox);
    }
    res.status(200).json({msg: 'ok'});
  }
}

module.exports = router;

# Current state of guppe

Guppe is a tech demo. It is missing a lot of features, and I am in the process of rewriting it's core code from scratch in the fully-implemented, [modular ActivityPub library activitypub-express](https://github.com/immers-space/activitypub-express). I'll try to keep up with major bugfixes, but I won't be adding any features to guppe until i finish apex and can port guppe over to the new engine.

# Gup.pe

Social groups for the fediverse - making it easy to connect and meet new people based on shared interests without the manipulation of your attention to maximize ad revenue nor the walled garden lock-in of capitalist social media.

This server-2-server ActivityPub implementation adds decentralized, federaded "groups" support across all ActivityPub compliant social media networks. Users join groups by following group-type actors on Guppe servers and contribute to groups by mentioning those same actors in a post. Guppe group actors will automatically forward posts they receive to all group members so that everyone in the group sees any post made to the group. Guppe group actors' profiles (e.g. outboxes) also serve as a group discussion history.

## Tech stack

MEVN: MongoDB, ExpressJS, Vue, NodeJS

## Installation

Instructions coming soon.

## License

Copyright (c) 2019 William Murphy. Licensed under the AGPL-3

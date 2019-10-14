<template>
  <div class="w3-container">
    <img alt="Guppe logo" src="/f/guppe.png">
    <h1>Guppe Groups</h1>
    <p>
Guppe brings social groups to the fediverse &mdash; making it easy to connect and meet new
people based on shared
interests without the maniuplation of your attention to maximize ad revenue nor the
walled garden lock-in of capitalist social media.
    </p>
    <h2>How does Guppe work?</h2>
    <ol>
      <li>Follow a user on @gup.pe to join that group</li>
      <li>Mention a user on @gup.pe to share a post with everyone in the group</li>
      <li>New groups are created on demand, just search for @YourGroupNameHere@gup.pe and it will show up</li>
      <li>Visit a @gup.pe user profile to see the group history</li>
    </ol>
    <p>
A Guppe Group has its own account and profile. 
This server-2-server ActivityPub implementation adds decentralized,
federaded "groups" support across all ActivityPub compliant social media networks.
Users join groups by following group-type actors on Guppe servers and contribute t
groups by mentioning those same actors in a post. Guppe group actors will
automatically forward posts they receive to all group members so that everyone in the
group sees any post made to the group. Guppe group actors' profiles (e.g. outboxes) also
serve as a group discussion history.
    </p>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'home',
  components: {
  }
}
</script>

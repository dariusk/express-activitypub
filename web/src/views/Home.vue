<template>
  <div class="w3-container">
    <div class="w3-center">
      <img alt="Guppe logo" src="/f/guppe.png">
    </div>
    <h1 class="w3-center">Guppe Groups</h1>
    <p>
      Guppe brings social groups to the fediverse &mdash; making it easy to connect and meet new
      people based on shared
      interests without the maniuplation of your attention to maximize ad revenue nor the
      walled garden lock-in of capitalist social media.
    </p>
    <h2 class="w3-center">How does Guppe work?</h2>
    <p>
      Guppe groups look like regular users you can interact with using your existing account on any
      ActivityPub service, but they automatically share anything you send them with all of their followers.
    </p>
    <ol>
      <li>Follow a group on @gup.pe to join that group</li>
      <li>Mention a group on @gup.pe to share a post with everyone in the group</li>
      <li>New groups are created on demand, just search for or mention @YourGroupNameHere@gup.pe and it will show up</li>
      <li>Visit a @gup.pe group profile to see the group history</li>
    </ol>
    <h2 class="w3-center">Active Groups</h2>
    <div class="profile-grid w3-margin-bottom w3-mobile">
      <div v-for="group of groups" class="w3-card w3-container w3-section" :key="group._id">
        <profile-summary :actor="group" class="profile"/>
        <router-link :to="`/u/${group.preferredUsername}`">Group profile...</router-link>
      </div>
    </div>

  </div>
</template>

<script>
import ProfileSummary from '@/components/ProfileSummary.vue'

export default {
  name: 'home',
  components: {
    ProfileSummary
  },
  data() {
    return {
      groups: [],
      error: null
    }
  },
  created () {
    window.fetch(`/u/`, {
      method: 'get',
      headers: {
        accept: 'application/json'
      }
    }).then(res => res.json())
      .then(json => {
        this.groups = json
      })
      .catch(err => this.error = err.message)
  }
}
</script>

<style scoped>
  .profile {
    width: 300px;
  }
  .profile-grid {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    align-content: space-between;
  }
</style>

<style>
  .profile-image {
    width: 75px;
  }
</style>
<template>
  <div class="w3-center">
      <img class="w3-image profile-image" :src="groupProfileSrc">
      <h2 class="w3-wide">{{ actor.preferredUsername }}</h2>
      <div class="w3-container">
        <span class="w3-container w3-show-inline-block"><i class="fas fa-users" title="Group members"></i>{{ followerCount}}</span>
        <span class="w3-container w3-show-inline-block"><i class="fas fa-mail-bulk" title="Group posts"></i>{{ postCount}}</span>
      </div>
      <p class="w3-opacity"><i>{{ actor.summary }}</i></p>
  </div>
</template>

<script>
export default {
  props: {
    actor: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      followerCount: undefined,
      postCount: undefined,
    }
  },
  computed: {
    groupProfileSrc () {
      return this.actor && this.actor.icon ? this.actor.icon.url : ''
    }
  },
  methods: {
    fetchInfo () {
      window.fetch(this.actor.followers, {
            method: 'get',
            headers: {
              accept: 'application/activity+json'
            }
          })
        .then(res => res.json())
        .then(followersCollection => {
          this.followerCount = followersCollection.totalItems
        })
      window.fetch(this.actor.outbox, {
            method: 'get',
            headers: {
              accept: 'application/activity+json'
            }
          })
        .then(res => res.json())
        .then(outboxCollection => {
          this.postCount = outboxCollection.totalItems
        })

    }
  },
  created () {
    this.fetchInfo()
  },
  updated () {
    this.fetchInfo()
  }
}
</script>

<style scoped>
  .fas {
    margin-right: 8px;
  }
  h2 {
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
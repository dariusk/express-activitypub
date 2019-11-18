<template>
  <div class="w3-container w3-content w3-center w3-padding-32">
    <profile-summary :actor="actor"/>
    <p class="w3-left-align">To join {{ actor.preferredUsername }}, enter your handle below and you'll be
      redirected back to this group's profile in your app where you can follow it.</p>
    <form class="w3-container">
      <label>Your account</label>
      <input v-model="handle" class="w3-input w3-center" placeholder="user@example.com" type="text">
      <button class="w3-btn w3-cyan w3-block w3-margin-top" @click.prevent="doFollow"
              :disabled="fetchingRemote">
        Procced to follow
      </button>
    </form>
    <div v-show="invalidHandle" class="w3-panel w3-pale-red w3-display-container w3-border">
        <span @click.prevent="invalidHandle = false" class="w3-button w3-large w3-display-topright">×</span>
        <h3>Double check that username</h3>
        <p>e.g. you@yourhost.com</p>
    </div>
    <div v-show="unreachable" class="w3-panel w3-pale-red w3-display-container w3-border">
        <span @click.prevent="unreachable = false" class="w3-button w3-large w3-display-topright">×</span>
        <h3>Oops</h3>
        <p>Couldn't connect with your host.</p>
        <p>You could try going back to your app and entering {{ groupHandle }} in the search instead</p>
    </div>
    <div class="w3-container w3-content w3-padding-64">
      <h2 class="w3-wide w3-center">Recent group posts</h2>
      <div>
        <post-card v-for="post of stream" :activity="post" :key="post.id"/>
      </div>
    </div>
  </div>
</template>

<script>
import PostCard from '@/components/PostCard.vue'
import ProfileSummary from '@/components/ProfileSummary.vue'

export default {
  components: {
    PostCard,
    ProfileSummary
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    postLimit: {
      type: Number,
      default: 20
    }
  },
  data () {
    return {
      actor: {},
      stream: {},
      error: null,
      handle: '',
      invalidHandle: false,
      unreachable: false,
      fetchingRemote: false,
    }
  },
  computed: {
    groupProfileSrc() {
      return this.actor && this.actor.icon ? this.actor.icon.url : ''
    },
    groupHandle() {
      if (this.actor.id && this.actor.preferredUsername) {
        const url = new window.URL(this.actor.id)
        return `@${this.actor.preferredUsername.toLowerCase()}@${url.host}`
      }
      return ''
    }
  },
  methods: {
    doFollow () {
      let acct, username, domain
      this.invalidHandle = false;
      this.unreachable = false;
      try {
        [acct, username, domain] = /@?([^@]+)@(.+)/.exec(this.handle)
      } catch (ignore) {
        this.invalidHandle = true
        return
      }
      this.fetchingRemote = true;
      window.fetch(`https://${domain}/.well-known/webfinger?resource=acct:${acct}`, {
        method: 'get',
        mode: 'cors',
        headers: {
          accept: 'application/json'
        }
      })
        .then(res => res.json())
        .then(json => {
          const link = json.links.find(l => l.rel === 'http://ostatus.org/schema/1.0/subscribe')
          window.location.href = link.template.replace('{uri}', '{{ groupAcct }}')
        })
        .catch(err => {
          console.log(err)
          this.unreachable = true
        })
        .then(() => {
          this.fetchingRemote = false
        })
    }
  },
  created () {
    window.fetch(`/u/${this.name}`, {
      method: 'get',
      headers: {
        accept: 'application/activity+json'
      }
    }).then(res => res.json())
      .then(json => {
        this.actor = json
      })
      .then(() => {
        return window.fetch(this.actor.outbox, {
          method: 'get',
          mode: 'cors',
          headers: {
            accept: 'application/activity+json'
          }
        })
      })
      .then(res => res.json())
      .then(outbox => {
        this.stream = outbox.orderedItems // || fetch page
          .filter(act => act.type === 'Announce')
          .slice(0, this.postLimit)
      })
      .catch(err => this.error = err.message)
  }
}
</script>

<style scoped>
  .w3-container.w3-content {
    max-width:800px;
  }
  .profile-main {
    height: 256px;
    width: 256px;
  }
</style>
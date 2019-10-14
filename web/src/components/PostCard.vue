<template>
  <div class="w3-card w3-margin-bottom">
    <div class="w3-container w3-left-align">
      <img class="icon" crossorigin="anonymous" :src="actorIconUrl">
      <label>
        <b>{{ actor.preferredUsername }}</b>
        <span class="w3-text-grey">@{{ actorHost }}</span>
      </label>
    </div>
    <div class="w3-container">
      <p v-html="post.content"></p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    activity: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      post: {},
      actor: {},
      isError: false,
    }
  },
  computed: {
    actorIconUrl() {
      return this.actor.icon && this.actor.icon.url
    },
    actorHost() {
      try {
        const id = new URL(this.actor.id)
        return id.host
      } catch (ignore) {
        return ''
      }
    }
  },
  methods: {
    resolveObject(idOrObject) {
      if (typeof idOrObject !== 'string') {
        return new Promise((resolve) => resolve(idOrObject))
      }
      return window.fetch(`/o/${encodeURIComponent(idOrObject)}`, {
        method: 'get',
        headers: {
          accept: 'application/activity+json'
        }
      })
        .then(res => res.json())
        .catch(err => {
          this.isError = true
          console.log(err.message)
        })
    }
  },
  created () {
    this.resolveObject(this.activity.object)
      .then(object => {
        this.post = object
        return this.resolveObject(this.post.attributedTo)
      })
      .then(actor => { this.actor = actor })
  }
}
</script>

<style scoped>
  .icon {
    width: 32px;
    height: 32px;
  }
</style>
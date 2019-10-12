<template>
  <div class="w3-card">
    <div class="actor">
      <img crossorigin="anonymous" :src="actorIconUrl">
      <label>
        {{ actor.preferredUsername }}
        <span class="muted">@{{ actorHost }}</span>
      </label>
    </div>
    <p v-html="post.content"></p>
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
  .actor img {
    width: 32px;
    height: 32px;
  }
  .actor label {
    font-weight: bold;
  }
  .actor label .muted {
    font-weight: normal;
    color: gray;
  }
</style>
<template>
  <div class="w3-card">
    <label>{{ post.actor }}</label>
    <p>{{ post.content }}</p>
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
      post: {}
    }
  },
  created () {
    if (typeof this.activity.object === 'string') {
      window.fetch(`/o/${encodeURIComponent(this.activity.object)}`, {
        method: 'get',
        headers: {
          accept: 'application/activity+json'
        }
      }).then(res => res.json())
        .then(post => {
          this.post = post
        })
        .catch(err => {
          this.post.content = err.message
        })
    } else {
      this.post = this.activity.object
    }
  }
}
</script>
<template>
  <div class="about">
    <h1>{{ actor.preferredUsername }} group</h1>
    <p> {{ actor.summary }}</p>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      required: true,
    }
  },
  data () {
    return {
      actor: {},
      error: null,
    }
  },
  created () {
    window.fetch(`https://localhost/u/${this.name}`, {
      method: 'get',
      headers: {
        accept: 'application/activity+json'
      }
    }).then(res => res.json())
      .then(json => this.actor = json)
      .catch(err => this.error = err.message)
  }
}
</script>

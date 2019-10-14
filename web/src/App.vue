<template>
  <div id="app">
    <!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div> -->
    <div class="w3-bar w3-black w3-card">&nbsp;</div>
    <div class="w3-row">
      <div class="w3-col s0 m2">&nbsp;</div>
      <div class="w3-col s12 m8 w3-content">
        <router-view/>
      </div>
      <div class="w3-col s0 m2">&nbsp;</div>
    </div>
    <footer class="w3-container w3-padding-64 w3-center w3-opacity w3-light-grey w3-xlarge">
      <a href="https://github.com/wmurphyrd/guppe"><i class="fa fa-github w3-hover-opacity"></i></a>
    </footer>
  </div>
</template>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>

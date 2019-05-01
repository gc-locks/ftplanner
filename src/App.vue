<template>
  <div id="app">
    <Process item="Reinforced Plank" speed="0.5"></Process>
  </div>
</template>

<script>
import Process from './Process.vue'
import Recipe from './assets/recipe.json'

export default {
  data() {
    return {
      message: 'Hello World',
      recipes: Recipe,
    };
  },
  components: {
    Process,
  }
};
</script>

<style>
#app {
  font-size: 18px;
  font-family: 'Roboto', sans-serif;
}
</style>

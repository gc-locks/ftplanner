<template>
  <div class="process">
    <div v-for="(recipe,index) in recipes[item]">
      <p class="name" @click="toggle(index)"><span class="item">{{ item }}</span> on {{ productionSpeed(recipe) }} [/s]</p>
      <div class="more" v-if="index === openIndex">
        <p v-if="isBuilding(recipe)">buildings: {{ recipe.building }} * {{ recipe.time * productionSpeed(recipe) }}</p>
        <Process v-for="i in recipe.input" :item="i.name" :speed="productionSpeed(recipe)*i.quantity"></Process>
      </div>
    </div>
  </div>
</template>

<script>
import Recipe from './assets/recipe.json'

export default {
  name: "Process",
  props: ['item', 'speed', 'recipe'],
  data() {
    return {
      recipes: Recipe,
      openIndex: 0,
    }
  },
  methods: {
    productionSpeed(recipe) {
      return this.speed / recipe.output[this.item]
    },
    toggle(i) {
      this.openIndex = i
    },
    isBuilding(recipe) {
      return !recipe.building.match(/^\(.*\)$/)
    }
  }
}
</script>

<style scoped>
.more {
  margin: 20px;
}
.item {
  color: blue;
}
</style>
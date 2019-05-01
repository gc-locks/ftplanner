<template>
  <div class="process" v-if="recipes[item]">
    <p class="name">
      <select v-if="recipes[item].length > 1" v-on:change="toggle">
        <option v-for="(recipe,index) in recipes[item]" :value="index">{{ recipeString(recipe) }}</option>
      </select>
      <span v-else class="item">{{ item }}</span> on {{ productionSpeed }} [/s]
    </p>
    <div class="more">
      <p v-if="isBuilding(recipe)">buildings: {{ recipe.building }} * {{ recipe.time * productionSpeed }}</p>
      <Process ref="inputs" v-for="i in recipe.input" :item="i.name" :speed="productionSpeed*i.quantity" @changed="$emit('changed')"></Process>
    </div>
  </div>
</template>

<script>
import Recipe from './assets/recipe.json'

export default {
  name: "Process",
  props: ['item', 'speed'],
  data() {
    return {
      recipes: Recipe,
      openIndex: 0
    }
  },
  computed: {
    recipe() {
      return this.recipes[this.item] && this.recipes[this.item][this.openIndex]
    },
    productionSpeed() {
      return this.recipe && (this.speed / this.recipe.output[this.item])
    }
  },
  methods: {
    recipeString(r) {
      let outputs = [];
      for (let key in r.output) {
        outputs.push(key + ' * ' + r.output[key])
      }
      let inputs = [];
      for (let i of r.input) {
        inputs.push(i.name + ' * ' + i.quantity)
      }
      return outputs.join(' + ') + ' <- ' + inputs.join(' + ')
    },

    toggle(e) {
      this.openIndex = e.target.selectedIndex;
      this.$emit('changed')
    },

    isBuilding(r) {
      return !r.building.match(/^\(.*\)$/)
    },

    requiredBuildings() {
      if (!this.recipe) {
        return []
      }

      let list = [{
        building: this.recipe.building,
        quantity: this.recipe.time * this.productionSpeed,
      }];

      if (this.$refs.inputs) {
        for (let c of this.$refs.inputs) {
          list.push(...c.requiredBuildings())
        }
      }

      return list
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
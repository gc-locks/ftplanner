<template>
  <div class="process">
    <p class="name">
      <span class="item">{{ node.item }}</span>
      <select v-if="node.candidates" v-model="selectedIndex">
        <option v-for="(r,index) in node.candidates" :value="index">{{ util.recipeString(r) }}</option>
      </select>
    </p>
    <div class="more" v-if="node.selected">
      <p v-if="isBuilding(node.selected.recipe.building)">
        buildings: {{ node.selected.recipe.building }} x {{ util.humanizedNumber(node.selected.recipe.time * node.speed) }}
      </p>
      <Process ref="inputs"
               v-for="n in node.next"
               :node="n"
               :key="n.id"
               @changed="changed">
      </Process>
    </div>
  </div>
</template>

<script>
import util from './util.js'

export default {
  name: "Process",
  props: ["node"],
  data() {
    return {
      util
    }
  },
  computed: {
    selectedIndex: {
      get() {
        return this.node.selected.index
      },
      set(selectedIndex) {
        this.$emit('changed', {
          id: this.node.id,
          selectedIndex,
        })
      }
    }
  },
  methods: {
    isBuilding(building) {
      return !building.match(/^\(.*\)$/)
    },

    changed(e) {
      this.$emit('changed', e)
    }
  }
}
</script>

<style scoped>
.more {
  margin: 20px;
}
.item {
  color: #666;
}
</style>
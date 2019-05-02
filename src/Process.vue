<template>
  <div class="process">
    <p class="name">
      <span class="item">{{ node.item }}</span>
    </p>
    <p class="name">
      <select v-if="node.candidates" v-model="selectedIndex">
        <option v-for="(r,index) in node.candidates" :value="index">{{ recipeString(r) }}</option>
      </select>
    </p>
    <div class="more" v-if="node.selected">
      <p v-if="isBuilding(node.selected.recipe.building)">
        buildings: {{ node.selected.recipe.building }} x {{ node.selected.recipe.time * node.speed }}
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
export default {
  name: "Process",
  props: ["node"],
  data() {
    return {
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
    recipeString(r) {
      let outputs = [];
      for (let key in r.output) {
        outputs.push(key + ' x ' + r.output[key])
      }
      let inputs = [];
      for (let i of r.input) {
        inputs.push(i.name + ' x ' + i.quantity)
      }
      return outputs.join(' + ') + ' <- ' + inputs.join(' + ')
    },

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
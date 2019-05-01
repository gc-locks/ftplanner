<template>
  <div id="app">
    <h1>Factory Town Planner</h1>

    <h2>Required items and production speeds</h2>
    <form>
      <div v-for="(name,index) in items">
        <select :name="'item[' + index + ']'">
          <optgroup v-for="(list, category) in sells" :label="category">
            <option v-for="s in list" :selected="s.item === name">{{ s.item }}</option>
          </optgroup>
        </select>
        <input type="text" :name="'speed[' + index + ']'" :value="speeds[index]"/> [/s]
      </div>
      <button @click="addItem">Add</button>
      <input type="submit" value="Go"/>
    </form>
    <hr/>
    <Process v-for="i in queryItems" ref="items" :item="i.name" :speed="i.speed" @changed="changeResult"></Process>
    <hr/>
    <h2>Total</h2>
    <p v-for="(quantity, building) in result">{{ building }} * {{ quantity }}</p>
  </div>
</template>

<script>
import Process from './Process.vue'
import Recipe from './assets/recipe.json'
import Sell from './assets/sell.json'
const queryString = require('query-string');

export default {
  data() {
    let q = queryString.parse(location.search, {arrayFormat: 'index'});
    return {
      message: 'Hello World',
      recipes: Recipe,
      sells: Sell,
      items: q.item || [],
      speeds: q.speed || [],
      result: {},
    };
  },
  computed: {
    queryItems() {
      let q = queryString.parse(location.search, {arrayFormat: 'index'});
      let items = [];
      for (let i in q.item) {
        items.push({
          name: q.item[i],
          speed: q.speed[i]
        })
      }
      return items
    }
  },
  methods: {
    addItem(e) {
      e.preventDefault();
      this.items.push('');
      this.speeds.push('');
      return false
    },
    changeResult() {
      let buildings = [];
      if (this.$refs.items) {
        for (let c of this.$refs.items) {
          buildings.push(...c.requiredBuildings());
        }
      }

      let result = {};
      for (let b of buildings) {
        if (!result[b.building]) {
          result[b.building] = 0
        }
        result[b.building] += b.quantity
      }
      this.result = result;
    }
  },
  mounted() {
    this.changeResult();
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

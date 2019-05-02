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

    <Process2 v-for="i in tree.next" ref="items" :node="i" :key="i.id" @changed="updateTree"></Process2>

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
      tree: {next: []},
      items: q.item || [],
      speeds: q.speed || [],
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
    },

    result() {
      let buildings = this.getBuildings(this.tree.next);

      let result = {};
      for (let b of buildings) {
        if (!result[b.building]) {
          result[b.building] = 0
        }
        result[b.building] += b.quantity
      }
      return result
    }
  },

  methods: {
    addItem(e) {
      e.preventDefault();
      this.items.push('');
      this.speeds.push('');
      return false
    },

    getBuildings(nodes) {
      let buildings = [];
      for (let n of nodes) {
        if (!n.selected) {
          continue;
        }

        buildings.push({
          item: n.item,
          building: n.selected.recipe.building,
          quantity: n.speed * n.selected.recipe.time
        });

        buildings.push(...this.getBuildings(n.next));
      }
      return buildings
    },

    createNode(id, item, speed) {
      let node = {
        id: id,
        item: item,
        speed: speed,
        next: [],
      };

      let candidates = this.recipes[item];
      if (!candidates) {
        node.candidates = undefined;
        node.selected = undefined;
        return node;
      }

      if (candidates.length > 1) {
        node.candidates = candidates;
      } else {
        node.candidates = undefined;
      }

      this.setNext(node, 0);

      return node
    },

    setNext(node, selectedIndex) {
      node.selected = {
        index: selectedIndex,
        recipe: this.recipes[node.item][selectedIndex]
      };

      let next = [];
      for (let i in node.selected.recipe.input) {
        if (node.selected.recipe.input.hasOwnProperty(i)) {
          let r = node.selected.recipe.input[i];
          let s = node.speed * r.quantity / node.selected.recipe.output[node.item];
          next.push(this.createNode(node.id + '-' + i, r.name, s));
        }
      }
      node.next = next
    },

    updateTree(e) {
      let node = this.tree;
      for (let s of e.id.split('-')) {
        node = node.next[parseInt(s)]
      }

      this.setNext(node, e.selectedIndex);
    }
  },

  mounted() {
    this.tree = {
      next: [this.createNode('' + 0, 'Rail Tile', 0.5)]
    };
  },

  components: {
    Process2: Process,
  }
};
</script>

<style>
#app {
  font-size: 18px;
  font-family: 'Roboto', sans-serif;
}
</style>

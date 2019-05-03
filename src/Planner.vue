<template>
  <div id="app">
    <h2>Required items and production speeds</h2>
    <form @submit="submit">
      <div v-for="i in params.items">
        <select v-model="i.item">
          <option disabled value="">-- Choose one ---</option>
          <optgroup v-for="(list, category) in sells" :label="category">
            <option v-for="s in list">{{ s.item }}</option>
          </optgroup>
        </select>
        <input type="text" v-model="i.speed"/> [/s]
      </div>
      <p>
        <label>
          <input type="checkbox" v-model="params.advanced"/> Advanced
        </label>
      </p>
      <div v-if="params.advanced">
        <h3>Default recipe</h3>
        <div v-for="(i, item) in params.defaultRecipe">
          {{ item }}
          <select v-model="params.defaultRecipe[item]">
            <option v-for="(r,index) in recipes[item]" :value="index">{{ util.recipeString(r) }}</option>
          </select>
        </div>
      </div>
      <input type="submit" value="Go"/>
      <button @click="addItem">Add</button>
    </form>

    <hr/>

    <Process v-for="i in tree.next" ref="items" :node="i" :key="i.id" @changed="updateTree"></Process>

    <hr/>

    <h2>Total</h2>
    <h3>Buildings</h3>
    <table>
      <thead>

      </thead>
      <tbody>
      <template v-for="(building, buildingName) in result.buildings">
        <tr v-for="(item, index) in building.itemsArray">
          <td v-if="index === 0" :rowspan="building.itemsArray.length">
            {{ buildingName }} x {{ util.humanizedNumber(building.sum) }}
          </td>
          <td>
            {{ util.humanizedNumber(item.quantity) }} for {{ item.name }}
          </td>
        </tr>
      </template>
      </tbody>
    </table>
    <h3>Consumptions</h3>
    <p v-for="(quantity, name) in result.consumptions">
      {{ name }} x {{ util.humanizedNumber(quantity) }}
    </p>
  </div>
</template>

<script>
import Process from './Process.vue'
import Recipe from './assets/recipe.json'
import Sell from './assets/sell.json'
import util from './util.js'

export default {
  data() {
    let params = {};
    if (this.$route.query && this.$route.query.params) {
      params = JSON.parse(this.$route.query.params);
    }

    if (!params.items) {
      params.items = [];
    }
    if (params.items.length === 0) {
      params.items.push({
        item: '',
        speed: 0,
      });
    }

    let defaultRecipe = {};
    for (let name in Recipe) {
      let r = Recipe[name];
      if (r.length > 1) {
        defaultRecipe[name] = 0;
      }
    }
    params.defaultRecipe = { ...defaultRecipe, ...(params.defaultRecipe || {}) };

    return {
      recipes: Recipe,
      sells: Sell,
      util,
      tree: {next: []},
      params
    };
  },

  computed: {
    result() {
      let buildings = this.getBuildings(this.tree.next);
      buildings = buildings.filter(function (i) {
        return util.isBuilding(i.building)
      });

      let resultBuildings = {};
      for (let b of buildings) {
        if (!resultBuildings[b.building]) {
          resultBuildings[b.building] = {
            sum: 0,
            items: {}
          }
        }
        let r = resultBuildings[b.building];

        r.sum += b.quantity;

        if (!r.items[b.item]) {
          r.items[b.item] = 0;
        }
        r.items[b.item] += b.quantity;
      }

      for (let b in resultBuildings) {
        let r = resultBuildings[b];

        let itemsArray = [];
        for (let i in r.items) {
          itemsArray.push({
            name: i,
            quantity: r.items[i]
          });
        }

        r.itemsArray = itemsArray
      }

      let consumptions = this.getConsumptions(this.tree.next);
      console.log(consumptions);

      let resultConsumptions = {};
      for (let c of consumptions) {
        if (!resultConsumptions[c.item]) {
          resultConsumptions[c.item] = 0;
        }
        resultConsumptions[c.item] += c.quantity;
      }

      return {
        buildings: resultBuildings,
        consumptions: resultConsumptions,
      }
    }
  },

  methods: {
    addItem(e) {
      e.preventDefault();
      this.params.items.push({
        item: '',
        speed: 0,
      });
      return false
    },

    updateParams(callback) {
      this.params.items = this.params.items.filter(function (i) {
        return i.item !== ''
      });

      this.$router.push({ path: '/', query: { params: JSON.stringify(this.params) } }, callback)
    },

    submit(e) {
      e.preventDefault();
      this.updateParams(this.updateTreeAll);
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

    getConsumptions(nodes) {
      let consumptions = [];
      for (let n of nodes) {
        if (!n.selected) {
          consumptions.push({
            item: n.item,
            quantity: n.speed
          });
        }

        consumptions.push(...this.getConsumptions(n.next));
      }
      return consumptions
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

      let index = 0;
      if (this.params.defaultRecipe[item]) {
        index = this.params.defaultRecipe[item];
      }
      this.setNext(node, index);

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
    },

    updateTreeAll() {
      let next = [];
      for (let index in this.params.items) {
        if (this.params.items.hasOwnProperty(index)) {
          let i = this.params.items[index];
          next.push(this.createNode('' + index, i.item, i.speed))
        }
      }

      this.tree = { next };
    }
  },

  mounted() {
    this.updateTreeAll();
  },

  components: {
    Process,
  }
};
</script>

<style>
table {
  border-collapse: collapse;
}
td {
  border: 1px solid #aaa;
  padding: 3px 5px;
}
</style>

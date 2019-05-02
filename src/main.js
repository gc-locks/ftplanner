import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import Planner from './Planner.vue';

Vue.use(VueRouter);

const routes = [{
  path: '/',
  component: Planner,
}];

const router = new VueRouter({
  routes
});

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');

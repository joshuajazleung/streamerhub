import '@babel/polyfill';
import Vue from 'vue';
import VueRouter from 'vue-router';

import Vuetify from 'vuetify';
import './scss/index.css';

import App from './views/layouts/App.vue';
import routes from './routes/index';

Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.component('app', App);

const router = new VueRouter({
    routes,
    mode: 'history'
});

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');

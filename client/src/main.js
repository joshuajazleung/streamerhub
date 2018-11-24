import '@babel/polyfill';
import Vue from 'vue';
import './plugins/vuetify';
import Vuetify from 'vuetify';
import VueAnalytics from 'vue-analytics';

import App from './App.vue';
import './assets/css/index.css';
import router from './router';

Vue.config.productionTip = false;

Vue.use(Vuetify);
Vue.use(VueAnalytics, {
    id: 'UA-129732371-1'
});

new Vue({
    render: h => h(App),
    router
}).$mount('#app');

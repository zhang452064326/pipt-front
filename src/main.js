import Vue from 'vue'

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss' // global css

import * as filters from './filters' // global filters

import App from './App.vue'
import router from './router'
import store from './store'

import Cookies from 'js-cookie'
import './icons' // icon
import i18n from './lang' // Internationalization
import './errorLog' // error log
import './permission' // permission control
import './registerServiceWorker'
import './mock' // simulation data

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')

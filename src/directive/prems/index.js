import prems from './prems'

const install = function(Vue) {
  Vue.directive('prems', prems)
}

if (window.Vue) {
  window.prems = prems
    Vue.use(install) // eslint-disable-line
}

prems.install = install
export default prems

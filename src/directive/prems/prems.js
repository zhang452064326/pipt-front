import store from '@/store/index'
export default {
  bind(el, binding) {
    const perms = store.state.perms.permsList.map(item => item.functionCode) // 按钮权限指令

    if (perms !== '*') {
      if (perms.indexOf(binding.value) < 0) {
        el.parentNode.removeChild(el) // 权限不通过删除元素
      } else {
        return false
      }
    } else {
      return false
    }
  }
}

import {
  premition
} from '@/api/login'
import {
// asyncRouterMap,
// constantRouterMap
} from '@/router'

import Layout from '@/views/layout/Layout'

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
// function hasPermission(roles, route) {
//   if (route.meta && route.meta.roles) {
//     return roles.some(role => route.meta.roles.includes(role))
//   } else {
//     return true
//   }
// }

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param routes asyncRouterMap
 * @param roles
 */
// function filterAsyncRouter(routes, roles) {
//   const res = []

//   routes.forEach(route => {
//     const tmp = {
//       ...route
//     }
//     if (hasPermission(roles, tmp)) {
//       if (tmp.children) {
//         tmp.children = filterAsyncRouter(tmp.children, roles)
//       }
//       res.push(tmp)
//     }
//   })

//   return res
// }

const permission = {
  state: {
    routers: [],
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      // state.routers = constantRouterMap.concat(routers)
      state.routers = routers
    }
  },
  actions: {
    // GenerateRoutes({ commit }, data) {
    //   return new Promise(resolve => {
    //     const { roles } = data
    //     let accessedRouters
    //     if (roles.includes('admin')) {
    //       accessedRouters = asyncRouterMap
    //     } else {
    //       accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
    //     }
    //     commit('SET_ROUTERS', accessedRouters)
    //     resolve()
    //   })
    // }
    // 用户名登录
    GenerateRoutes({
      commit
    }, data) {
      return new Promise((resolve, reject) => {
        // 获取个人菜单数据
        premition().then((response) => {
          if (response.data.status !== 401) {
            const routerList = response.data.data

            var personalRouterList = []
            var itemChildren = []

            routerList.forEach(item => {
              var ele = {
                children: []
              }
              itemChildren = item.children
              ele.path = item.menuPath
              // ele.redirect = '/userManagement/download'
              ele.component = Layout
              ele.alwaysShow = true
              ele.meta = {
                title: item.menuName,
                icon: 'zip'
              }
              itemChildren.forEach((item1) => {
                var eleChildren = {}
                eleChildren.path = item1.menuName
                eleChildren.component = () =>
                                    import(`@/views/${item1.menuPath}/index`)
                eleChildren.name = item1.menuName
                eleChildren.meta = {
                  title: item1.menuName
                }
                ele.children.push(eleChildren)
              })
              personalRouterList.push(ele)
            })
            const accessedRouters = personalRouterList
            commit('SET_ROUTERS', accessedRouters)
            resolve(response)
          } else {
            resolve(response)
          }
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default permission

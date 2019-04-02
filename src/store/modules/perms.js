import {
  getUserFunction
} from '@/api/article'
const perms = {
  state: {
    permsList: []
  },
  mutations: {
    SET_PERMS: (state, data) => {
      state.permsList = data
    }
  },
  actions: {
    GetUserFunction({
      commit
    }) {
      return new Promise((resolve, reject) => {
        getUserFunction().then(response => {
          // 由于mockjs 不支持自定义状态码只能这样hack
          if (response.data.status === 200) {
            const data = response.data.data
            commit('SET_PERMS', data)
          } else {
            reject(response.data.message)
          }
          // if (!response.data) {
          //   reject('Verification failed, please login again.')
          // }
          // const data = response.data.data
          // if (data && data.length > 0) { // 验证返回的roles是否是一个非空数组
          //   commit('SET_PERMS', data)
          // } else {
          //   reject('getUserFunction: Function must be a non-null array!')
          // }
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default perms

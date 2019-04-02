import request from '@/utils/request'

export function loginByUsername(name, pwd) {
  const data = {
    name,
    pwd
  }
  return request({
    url: '/api/v1/login',
    method: 'post',
    params: data
  })
}

// zzh修改
export function logout() {
  return request({
    url: '/api/v1/logout',
    method: 'post'
  })
}

// 获取个人的菜单数据1
export function premition() {
  return request({
    url: '/api/v1/menu/user',
    method: 'post'
  })
}

export function getUserInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: {
      token
    }
  })
}

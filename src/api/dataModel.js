import request from '@/utils/request'

export function loginByUser() {
  return request({
    url: '/api/v1/login',
    method: 'post',
    params: {
      name: 'kewei',
      pwd: 'pass@word1'
    }
  })
}

export function getModelInfo() {
  return request({
    url: '/data/model/get',
    method: 'get',
    params: {
      id: '127'
    }
  })
}

export function getTables(p) {
  return request({
    url: '/data/model/tables',
    method: 'get',
    params: p
  })
}

export function queryModel(query) {
  return request({
    url: '/data/model/query',
    method: 'post',
    data: query
  })
}

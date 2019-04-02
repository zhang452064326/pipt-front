import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/v1/function/getAllFunctionsPage',
    method: 'post',
    params: {
      pageNum: query.page,
      pageSize: query.limit,
      keywords: query.keywords
    }
  })
}

// 功能点编辑
export function updateFunction(data) {
  return request({
    url: '/api/v1/function/updateFunction',
    method: 'post',
    data
  })
}

// 新增功能点
export function addFunction(data) {
  return request({
    url: '/api/v1/function/addFunction',
    method: 'post',
    params: {
      functionCode: data.functionCode,
      functionDescription: data.functionDescription,
      functionName: data.functionName
    }
  })
}

// 删除用户
export function deleteFunction(data) {
  return request({
    url: '/api/v1/function/deleteFunctions ',
    method: 'post',
    data
  })
}

import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/v1/department/departmentPage',
    method: 'post',
    params: {
      pageNum: query.page,
      pageSize: query.limit,
      keywords: query.keywords
    }
  })
}

// 编辑部门
export function updateDepartment(data) {
  return request({
    url: '/api/v1/department/update',
    method: 'post',
    data
  })
}

// 新增部门
export function addDepartment(data) {
  return request({
    url: '/api/v1/department/add',
    method: 'post',
    data
  })
}

// 删除用户
export function deleteDepartment(data) {
  return request({
    url: '/api/v1/department/delete',
    method: 'post',
    data
  })
}

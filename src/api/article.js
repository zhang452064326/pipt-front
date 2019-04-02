import request from '@/utils/request'

// 获取用户列表信息
export function fetchList(query) {
  return request({
    url: '/api/v1/getAllUsers',
    method: 'post',
    params: {
      pageNum: query.page,
      pageSize: query.limit,
      keywords: query.keywords
    }
  })
}

// 获取用户所有功能点
export function getUserFunction() {
  return request({
    url: '/api/v1/function/user',
    method: 'post'
  })
}
// 获取用户详细信息
export function getUserDetailsByUserId(data) {
  return request({
    url: '/api/v1/getUserDetailsByUserId',
    method: 'post',
    data
  })
}

// 用户导出
export function exportUserToleExcel(data) {
  return request({
    url: '/api/v1/exportUserToExcel',
    method: 'post',
    data
  })
}

// 用户导出模板
export function exportUserTempleExcel() {
  return request({
    url: '/api/v1/exportUserTempleExcel',
    method: 'post'
  })
}

// 获取系统所有角色
export function getAllUserRole() {
  return request({
    url: '/api/v1/role/getAllUserRole',
    method: 'post'
  })
}

// 获取系统所有部门
export function getAllDepartment() {
  return request({
    url: '/api/v1/department/all',
    method: 'post'
  })
}

// 用户信息编辑
export function updateSysUser(data) {
  return request({
    url: '/api/v1/updateSysUser',
    method: 'post',
    data
  })
}

// 新增用户
export function addSysUser(data) {
  return request({
    url: '/api/v1/addSysUser',
    method: 'post',
    data
  })
}

// 删除用户
export function deleteSysUser(data) {
  return request({
    url: '/api/v1/deleteSysUser',
    method: 'post',
    data
  })
}

// 删除角色
export function deleteRoles(data) {
  return request({
    url: '/api/v1/role/deleteRoles',
    method: 'post',
    data
  })
}

// 获取角色列表信息
export function getAllUserRolePage(query) {
  return request({
    url: '/api/v1/role/getAllUserRolePage',
    method: 'post',
    params: {
      pageNum: query.page,
      pageSize: query.limit,
      keywords: query.keywords
    }
  })
}

// 新增角色
export function addRoleDetailsByRoleId(data) {
  return request({
    url: '/api/v1/role/AddRoleDetailsByRoleId',
    method: 'post',
    data
  })
}

// 根据角色获取角色的菜单及功能点
export function getUserRoleDetailsByRoleId(data) {
  return request({
    url: '/api/v1/role/getUserRoleDetailsByRoleId',
    method: 'post',
    data
  })
}

// 获取系统所有的菜单数据
export function allMenu() {
  return request({
    url: '/api/v1/menu/all',
    method: 'post'
  })
}

// 获取系统所有的功能点
export function allFunction() {
  return request({
    url: '/api/v1/function/all',
    method: 'post'
  })
}

// 角色信息编辑
export function updateRoleDetailsByRoleId(data) {
  return request({
    url: '/api/v1/role/UpdateRoleDetailsByRoleId',
    method: 'post',
    data
  })
}

export function fetchArticle(id) {
  return request({
    url: '/article/detail',
    method: 'get',
    params: {
      id
    }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/article/pv',
    method: 'get',
    params: {
      pv
    }
  })
}

export function createArticle(data) {
  return request({
    url: '/article/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/article/update',
    method: 'post',
    data
  })
}

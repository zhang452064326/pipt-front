import request from '@/utils/request'

export function getOrganize(query) {
  return request({
    url: '/api/v1/findAllOrg',
    method: 'post',
    params: query
  })
}

export function getDepart(query) {
  return request({
    url: '/api/v1/findAllOrgDepartment',
    method: 'post',
    params: query
  })
}

export function getPeople(query) {
  return request({
    url: '/api/v1/findAllOrgPeople',
    method: 'post',
    params: query
  })
}

export function saveOrg(query) {
  return request({
    url: '/api/v1/saveOrg',
    method: 'post',
    data: query
  })
}

export function saveOrgDepartment(query) {
  return request({
    url: '/api/v1/saveOrgDepartment',
    method: 'post',
    data: query
  })
}

export function saveOrgPeople(query) {
  return request({
    url: '/api/v1/saveOrgPeople',
    method: 'post',
    data: query
  })
}

export function delOrg(query) {
  return request({
    url: '/api/v1/delOrg',
    method: 'post',
    data: query
  })
}

export function delOrgDepartment(query) {
  return request({
    url: '/api/v1/delOrgDepartment',
    method: 'post',
    data: query
  })
}

export function delOrgPeople(query) {
  return request({
    url: '/api/v1/delOrgPeople',
    method: 'post',
    data: query
  })
}

export function getExcelOrgPeople() {
  return request({
    url: '/api/v1/getExcelOrgPeople',
    method: 'get'
  })
}

export function updateOrg(query) {
  return request({
    url: '/api/v1/updateOrg',
    method: 'post',
    data: query
  })
}

export function updateOrgDepartment(query) {
  return request({
    url: '/api/v1/updateOrgDepartment',
    method: 'post',
    data: query
  })
}

export function updateOrgPeople(query) {
  return request({
    url: '/api/v1/updateOrgPeople',
    method: 'post',
    data: query
  })
}

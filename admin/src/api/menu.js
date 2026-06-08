import http from '@/utils/http'

const basicRoute = '/api/v1/menu/menu'

export const myMenu = () => {
  return http.get('/api/v1/menu/my-menu')
}

export const getMenuList = (params) => {
  return http.get(basicRoute, {
    params
  })
}

export const addMenu = (data) => {
  return http.post(basicRoute, data)
}

export const editMenu = (id, data) => {
  return http.patch(`${basicRoute}/${id}`, data)
}

export const deleteMenu = id => {
  return http.delete(`${basicRoute}/${id}`)
}
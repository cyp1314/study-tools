import http from '@/utils/http'

const BASE = '/api/v1/admin/recharge-package'

export const getRechargePackageList = () => {
  return http.get(BASE)
}

export const getRechargePackage = (id) => {
  return http.get(`${BASE}/${id}`)
}

export const addRechargePackage = (data) => {
  return http.post(BASE, data)
}

export const editRechargePackage = (id, data) => {
  return http.put(`${BASE}/${id}`, data)
}

export const deleteRechargePackage = (id) => {
  return http.delete(`${BASE}/${id}`)
}

export const toggleRechargePackage = (id) => {
  return http.patch(`${BASE}/${id}/toggle`)
}

import http from '@/utils/http'

export const login = (data) => {
  return http.post('/api/v1/admin-auth/login', data)
}

export const logout = () => {
  return http.post('/api/v1/auth/logout')
}
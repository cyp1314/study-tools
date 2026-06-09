import http from '@/utils/http'

export const uploadImage = (data) => {
  return http.post('/api/v1/common/upload', data)
}
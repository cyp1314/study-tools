export default [
  // 权限相关（预留，当前不需要）
  {
    url: '/api/v1/permission-user-all',
    method: 'get',
    response: () => {
      return { data: [] }
    }
  },
  {
    url: '/api/v1/permission',
    method: 'get',
    response: () => {
      return { data: [] }
    }
  },
  {
    url: '/api/v1/permission-group',
    method: 'get',
    response: () => {
      return { data: [] }
    }
  },
]
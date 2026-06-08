export default [
  // 权限组相关（预留，当前不需要）
  {
    url: '/api/v1/permission-group',
    method: 'get',
    response: () => {
      return { data: [] }
    }
  },
]
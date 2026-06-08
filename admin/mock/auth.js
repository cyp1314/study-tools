export default [
  {
    url: '/api/v1/admin-auth/login',
    method: 'post',
    response: ({ body }) => {
      const { username, password } = body
      if (username === 'admin' && password === '123456') {
        return {
          data: {
            token: "48|ebuGxNhidTL3gkJBkBt2pMBvuC7OwZ81inG4zV2b",
            user: {
              id: 1,
              username: "admin"
            }
          }
        }
      }
      return {
        statusCode: 401,
        data: { code: -1, message: '用户名或密码错误' }
      }
    }
  },
  {
    url: '/api/v1/auth/logout',
    method: 'post',
    statusCode: 204,
  },
  {
    url: 'api/user-change-password',
    method: 'patch',
    statusCode: 204,
  }
]
export default [
  // 充值套餐
  {
    url: '/api/v1/admin/recharge-package',
    method: 'get',
    response: () => {
      return {
        data: [
          { id: 1, name: '100积分', points: 100, bonus: 0, amount: 9.9, sort_order: 1, is_active: 1 },
          { id: 2, name: '500积分', points: 500, bonus: 50, amount: 39.9, sort_order: 2, is_active: 1 },
          { id: 3, name: '1000积分', points: 1000, bonus: 150, amount: 69.9, sort_order: 3, is_active: 1 },
          { id: 4, name: '3000积分', points: 3000, bonus: 500, amount: 179.9, sort_order: 4, is_active: 1 },
        ]
      }
    }
  },
  {
    url: '/api/v1/admin/recharge-package/:id',
    method: 'get',
    response: ({ params }) => {
      const packages = {
        1: { id: 1, name: '100积分', points: 100, bonus: 0, amount: 9.9, sort_order: 1, is_active: 1 },
        2: { id: 2, name: '500积分', points: 500, bonus: 50, amount: 39.9, sort_order: 2, is_active: 1 },
      }
      return { data: packages[params.id] || {} }
    }
  },
  {
    url: '/api/v1/admin/recharge-package',
    method: 'post',
    statusCode: 201,
    response: ({ body }) => {
      return { data: { id: Date.now() } }
    }
  },
  {
    url: '/api/v1/admin/recharge-package/:id',
    method: 'put',
    statusCode: 204
  },
  {
    url: '/api/v1/admin/recharge-package/:id',
    method: 'delete',
    statusCode: 204
  },
  {
    url: '/api/v1/admin/recharge-package/:id/toggle',
    method: 'patch',
    statusCode: 204
  },
]
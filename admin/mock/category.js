export default [
  // 分类
  {
    url: '/api/v1/admin/category',
    method: 'get',
    response: () => {
      return {
        data: [
          { id: 1, name: '涂色画', icon: 'brush', sort_order: 1, is_active: 1, created_at: '2026-01-01 10:00:00' },
          { id: 2, name: '书法字帖', icon: 'edit', sort_order: 2, is_active: 1, created_at: '2026-01-02 10:00:00' },
          { id: 3, name: '诗词插画', icon: 'picture', sort_order: 3, is_active: 1, created_at: '2026-01-03 10:00:00' },
          { id: 4, name: '英语学习', icon: 'chat-dot-round', sort_order: 4, is_active: 1, created_at: '2026-01-04 10:00:00' },
          { id: 5, name: '数学练习', icon: 'sunny', sort_order: 5, is_active: 1, created_at: '2026-01-05 10:00:00' },
          { id: 6, name: '拼音练习', icon: 'reading', sort_order: 6, is_active: 1, created_at: '2026-01-06 10:00:00' },
          { id: 7, name: '趣味游戏', icon: 'gamepad', sort_order: 7, is_active: 1, created_at: '2026-01-07 10:00:00' },
        ]
      }
    }
  },
  {
    url: '/api/v1/admin/category/:id',
    method: 'get',
    response: ({ params }) => {
      const categories = {
        1: { id: 1, name: '涂色画', icon: 'brush', sort_order: 1, is_active: 1, created_at: '2026-01-01 10:00:00' },
        2: { id: 2, name: '书法字帖', icon: 'edit', sort_order: 2, is_active: 1, created_at: '2026-01-02 10:00:00' },
      }
      return { data: categories[params.id] || {} }
    }
  },
  {
    url: '/api/v1/admin/category',
    method: 'post',
    statusCode: 201,
    response: ({ body }) => {
      return { data: { id: Date.now() } }
    }
  },
  {
    url: '/api/v1/admin/category/:id',
    method: 'put',
    statusCode: 204
  },
  {
    url: '/api/v1/admin/category/:id',
    method: 'delete',
    statusCode: 204
  },
  {
    url: '/api/v1/admin/category/:id/toggle',
    method: 'patch',
    statusCode: 204
  },
]
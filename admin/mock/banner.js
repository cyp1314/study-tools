export default [
  // 轮播图
  {
    url: '/api/v1/admin/banner',
    method: 'get',
    response: () => {
      return {
        data: [
          { id: 1, title: '首页Banner', image_key: '', link_type: 'none', link_url: '', sort_order: 1, is_active: 1, created_at: '2026-01-01 10:00:00' },
          { id: 2, title: '活动Banner', image_key: '', link_type: 'page', link_url: '/product/1', sort_order: 2, is_active: 1, created_at: '2026-01-02 10:00:00' },
        ]
      }
    }
  },
  {
    url: '/api/v1/admin/banner/:id',
    method: 'get',
    response: ({ params }) => {
      const banners = {
        1: { id: 1, title: '首页Banner', image_key: '', link_type: 'none', link_url: '', sort_order: 1, is_active: 1, created_at: '2026-01-01 10:00:00' },
        2: { id: 2, title: '活动Banner', image_key: '', link_type: 'page', link_url: '/product/1', sort_order: 2, is_active: 1, created_at: '2026-01-02 10:00:00' },
      }
      return { data: banners[params.id] || {} }
    }
  },
  {
    url: '/api/v1/admin/banner',
    method: 'post',
    statusCode: 201,
    response: ({ body }) => {
      return { data: { id: Date.now() } }
    }
  },
  {
    url: '/api/v1/admin/banner/:id',
    method: 'put',
    statusCode: 204
  },
  {
    url: '/api/v1/admin/banner/:id',
    method: 'delete',
    statusCode: 204
  },
  {
    url: '/api/v1/admin/banner/:id/toggle',
    method: 'patch',
    statusCode: 204
  },
]
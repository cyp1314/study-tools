export default [
  // 用户管理
  {
    url: '/api/v1/admin/user',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 20, keyword = '' } = query
      const list = [
        { id: 1, nickname: '张三', phone: '13800138000', role: 'user', balance: 100, total_earned: 150, total_spent: 50, created_at: '2026-01-01 10:00:00' },
        { id: 2, nickname: '李四', phone: '13900139000', role: 'user', balance: 50, total_earned: 100, total_spent: 50, created_at: '2026-01-02 10:00:00' },
      ]
      let filtered = list
      if (keyword) {
        filtered = list.filter(u => u.nickname.includes(keyword) || u.phone.includes(keyword))
      }
      return {
        data: {
          list: filtered.slice((page - 1) * pageSize, page * pageSize),
          total: filtered.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },
  {
    url: '/api/v1/admin/user/:id',
    method: 'get',
    response: ({ params }) => {
      const users = {
        1: { id: 1, nickname: '张三', phone: '13800138000', role: 'user', balance: 100, total_earned: 150, total_spent: 50, created_at: '2026-01-01 10:00:00' },
        2: { id: 2, nickname: '李四', phone: '13900139000', role: 'user', balance: 50, total_earned: 100, total_spent: 50, created_at: '2026-01-02 10:00:00' },
      }
      return { data: users[params.id] || {} }
    }
  },
  {
    url: '/api/v1/admin/user/:id',
    method: 'put',
    statusCode: 204
  },
  {
    url: '/api/v1/admin/user/:id/adjust-points',
    method: 'post',
    statusCode: 204
  },
  {
    url: '/api/v1/admin/user/:id',
    method: 'delete',
    statusCode: 204
  },
  // 图片记录
  {
    url: '/api/v1/admin/image-record',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 20, type = '', status = '' } = query
      const list = [
        { id: 1, type: 'coloringBook', status: 'success', user_input: '小兔子', created_at: '2026-06-01 10:00:00' },
        { id: 2, type: 'sketchColoring', status: 'success', user_input: '城堡', created_at: '2026-06-02 10:00:00' },
        { id: 3, type: 'coloringBook', status: 'failed', user_input: '恐龙', created_at: '2026-06-03 10:00:00' },
      ]
      let filtered = list
      if (type) filtered = filtered.filter(l => l.type === type)
      if (status) filtered = filtered.filter(l => l.status === status)
      return {
        data: {
          list: filtered.slice((page - 1) * pageSize, page * pageSize),
          total: filtered.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },
  {
    url: '/api/v1/admin/image-record/:id',
    method: 'get',
    response: ({ params }) => {
      const records = {
        1: { id: 1, type: 'coloringBook', status: 'success', user_input: '小兔子', created_at: '2026-06-01 10:00:00' },
        2: { id: 2, type: 'sketchColoring', status: 'success', user_input: '城堡', created_at: '2026-06-02 10:00:00' },
      }
      return { data: records[params.id] || {} }
    }
  },
  {
    url: '/api/v1/admin/image-record/:id',
    method: 'delete',
    statusCode: 204
  },
  // 积分记录
  {
    url: '/api/v1/admin/point-log',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 20, userId = '', type = '' } = query
      const list = [
        { id: 1, user_id: 1, type: 'sign_in', amount: 10, balance_after: 100, remark: '签到奖励', created_at: '2026-06-01 10:00:00', nickname: '张三' },
        { id: 2, user_id: 1, type: 'generate', amount: -10, balance_after: 90, remark: '生成涂色绘本', created_at: '2026-06-01 11:00:00', nickname: '张三' },
        { id: 3, user_id: 2, type: 'recharge', amount: 100, balance_after: 150, remark: '充值100积分', created_at: '2026-06-02 10:00:00', nickname: '李四' },
      ]
      let filtered = list
      if (userId) filtered = filtered.filter(l => l.user_id === parseInt(userId))
      if (type) filtered = filtered.filter(l => l.type === type)
      return {
        data: {
          list: filtered.slice((page - 1) * pageSize, page * pageSize),
          total: filtered.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },
  // 签到配置
  {
    url: '/api/v1/admin/signin-config',
    method: 'get',
    response: () => {
      return {
        data: [
          { id: 1, continuous_days: 1, reward_points: 5, is_active: 1 },
          { id: 2, continuous_days: 2, reward_points: 10, is_active: 1 },
          { id: 3, continuous_days: 3, reward_points: 15, is_active: 1 },
          { id: 4, continuous_days: 4, reward_points: 20, is_active: 1 },
          { id: 5, continuous_days: 5, reward_points: 25, is_active: 1 },
          { id: 6, continuous_days: 6, reward_points: 35, is_active: 1 },
          { id: 7, continuous_days: 7, reward_points: 50, is_active: 1 },
        ]
      }
    }
  },
  {
    url: '/api/v1/admin/signin-config',
    method: 'post',
    statusCode: 201
  },
  {
    url: '/api/v1/admin/signin-config/:id',
    method: 'put',
    statusCode: 204
  },
  {
    url: '/api/v1/admin/signin-config/:id',
    method: 'delete',
    statusCode: 204
  },
  // 签到记录
  {
    url: '/api/v1/admin/signin-record',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 20, userId = '' } = query
      const list = [
        { id: 1, user_id: 1, sign_date: '2026-06-01', continuous_days: 1, earned_points: 5, created_at: '2026-06-01 10:00:00', nickname: '张三' },
        { id: 2, user_id: 1, sign_date: '2026-06-02', continuous_days: 2, earned_points: 10, created_at: '2026-06-02 10:00:00', nickname: '张三' },
        { id: 3, user_id: 2, sign_date: '2026-06-01', continuous_days: 1, earned_points: 5, created_at: '2026-06-01 10:00:00', nickname: '李四' },
      ]
      let filtered = list
      if (userId) filtered = filtered.filter(l => l.user_id === parseInt(userId))
      return {
        data: {
          list: filtered.slice((page - 1) * pageSize, page * pageSize),
          total: filtered.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },
  {
    url: '/api/v1/admin/signin-record/:id',
    method: 'delete',
    statusCode: 204
  },
  // 充值订单
  {
    url: '/api/v1/admin/recharge-order',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 20, status = '', userId = '' } = query
      const list = [
        { id: 1, user_id: 1, order_no: 'R20260601001', points: 100, amount: 9.9, status: 'paid', payment_method: 'wechat', paid_at: '2026-06-01 10:05:00', created_at: '2026-06-01 10:00:00', nickname: '张三' },
        { id: 2, user_id: 2, order_no: 'R20260602001', points: 500, amount: 39.9, status: 'pending', payment_method: '', paid_at: null, created_at: '2026-06-02 10:00:00', nickname: '李四' },
        { id: 3, user_id: 1, order_no: 'R20260603001', points: 1000, amount: 69.9, status: 'paid', payment_method: 'alipay', paid_at: '2026-06-03 10:05:00', created_at: '2026-06-03 10:00:00', nickname: '张三' },
      ]
      let filtered = list
      if (status) filtered = filtered.filter(l => l.status === status)
      if (userId) filtered = filtered.filter(l => l.user_id === parseInt(userId))
      return {
        data: {
          list: filtered.slice((page - 1) * pageSize, page * pageSize),
          total: filtered.length,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      }
    }
  },
  {
    url: '/api/v1/admin/recharge-order/:id',
    method: 'get',
    response: ({ params }) => {
      const orders = {
        1: { id: 1, user_id: 1, order_no: 'R20260601001', points: 100, amount: 9.9, status: 'paid', payment_method: 'wechat', paid_at: '2026-06-01 10:05:00', created_at: '2026-06-01 10:00:00', nickname: '张三', phone: '13800138000' },
        2: { id: 2, user_id: 2, order_no: 'R20260602001', points: 500, amount: 39.9, status: 'pending', payment_method: '', paid_at: null, created_at: '2026-06-02 10:00:00', nickname: '李四', phone: '13900139000' },
      }
      return { data: orders[params.id] || {} }
    }
  },
  {
    url: '/api/v1/admin/recharge-order/:id/pay',
    method: 'patch',
    statusCode: 204
  },
  {
    url: '/api/v1/admin/recharge-order/:id/refund',
    method: 'patch',
    statusCode: 204
  },
]
export default [
  // 验证码（预留，当前登录不需要）
  {
    url: '/api/v1/captcha',
    method: 'get',
    response: () => {
      return {
        data: {
          key: 'captcha_key_' + Date.now(),
          image_content: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiNjY2MiLz48dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzMzMyI+MDEyMzQ1Njc4PC90ZXh0Pjwvc3ZnPg==',
          expired_at: '2027-01-01 00:00:00'
        }
      }
    }
  },
]
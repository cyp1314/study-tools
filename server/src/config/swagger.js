const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Study Tools Server API',
    version: '1.0.0',
    description: '基于 Koa 的学习工具后端服务,提供图片生成、用户管理、积分系统等功能',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: '开发环境',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Token(登录接口返回,放在请求头 `Authorization: Bearer <token>`)',
      },
    },
  },
  tags: [
    { name: '基础', description: '基础路由' },
    { name: '认证', description: '用户认证相关接口' },
    { name: '用户', description: '用户管理相关接口' },
    { name: '图片生成', description: '图片生成相关接口' },
    { name: '积分', description: '积分相关接口' },
    { name: '签到', description: '签到相关接口' },
    { name: '充值', description: '充值相关接口' },
    { name: '业务公开', description: '业务公开接口(无需登录)' },
    { name: '管理后台-充值套餐', description: '充值套餐管理' },
    { name: '管理后台-用户', description: '用户管理' },
    { name: '管理后台-图片记录', description: '图片记录管理' },
    { name: '管理后台-积分记录', description: '积分记录管理' },
    { name: '管理后台-签到配置', description: '签到配置管理' },
    { name: '管理后台-签到记录', description: '签到记录管理' },
    { name: '管理后台-充值订单', description: '充值订单管理' },
    { name: '管理后台-轮播图', description: '轮播图管理' },
    { name: '管理后台-分类', description: '分类管理' },
    { name: '管理后台-产品', description: '产品管理' },
  ],
};

const options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.js',
    './src/routes/admin-swagger-docs.js',
  ],
  swaggerOptions: {
    explorer: true,
  },
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

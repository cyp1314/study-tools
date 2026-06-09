require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'study_tools',
  },
  ai: {
    apiKey: process.env.AI_API_KEY || '',
    apiBase: process.env.AI_API_BASE || 'https://api.deepseek.com/v1',
    model: process.env.AI_MODEL || 'deepseek-chat',
  },
  volc: {
    accessKey: process.env.VOLC_ACCESS_KEY || '',
    secretKey: process.env.VOLC_SECRET_KEY || '',
  },
  qiniu: {
    accessKey: process.env.QINIU_ACCESS_KEY || '',
    secretKey: process.env.QINIU_SECRET_KEY || '',
    bucket: process.env.QINIU_BUCKET || '',
    domain: process.env.QINIU_DOMAIN || '',
    region: process.env.QINIU_REGION || 'Zone_z2',
  },
  wx: {
    appId: process.env.WX_MINI_APPID || '',
    appSecret: process.env.WX_MINI_SECRET || '',
    // 微信支付配置
    mchId: process.env.WX_MCH_ID || '', // 商户号
    apiV3Key: process.env.WX_API_V3_KEY || '', // APIv3密钥
    serialNo: process.env.WX_SERIAL_NO || '', // 证书序列号
    privateKey: process.env.WX_PRIVATE_KEY || '', // 商户私钥（或私钥文件路径）
    notifyUrl: process.env.WX_NOTIFY_URL || '', // 支付回调地址
  },
  points: {
    perGeneration: parseInt(process.env.POINTS_PER_GENERATION, 10) || 10,
    newUserBonus: parseInt(process.env.NEW_USER_BONUS, 10) || 50,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

module.exports = config;

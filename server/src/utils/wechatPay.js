const Payment = require('wechatpay-node-v3');
const config = require('../config');

// 微信支付实例
let payment = null;

/**
 * 初始化微信支付实例
 */
function initPayment() {
  const { wx } = config;

  if (!wx.mchId || !wx.apiV3Key || !wx.serialNo || !wx.privateKey) {
    console.warn('[WechatPay] 微信支付配置不完整，支付功能将不可用');
    return null;
  }

  try {
    payment = new Payment({
      appid: wx.appId,
      mchid: wx.mchId,
      serial_no: wx.serialNo,
      privateKey: wx.privateKey, // 支持私钥内容或文件路径
      apiv3_private_key: wx.apiV3Key,
    });
    console.log('[WechatPay] 初始化成功');
    return payment;
  } catch (error) {
    console.error('[WechatPay] 初始化失败:', error.message);
    return null;
  }
}

// 延迟初始化
function getPayment() {
  if (!payment) {
    payment = initPayment();
  }
  return payment;
}

/**
 * 创建JSAPI支付订单（小程序支付）
 * @param {object} params
 * @param {string} params.orderNo - 商户订单号
 * @param {number} params.amount - 金额（分）
 * @param {string} params.description - 商品描述
 * @param {string} params.openid - 用户openid
 * @returns {Promise<object>} - 返回前端调起支付需要的参数
 */
async function createJsapiOrder({ orderNo, amount, description, openid }) {
  const pay = getPayment();
  if (!pay) {
    throw new Error('微信支付未初始化');
  }

  const { wx } = config;

  const params = {
    description,
    out_trade_no: orderNo,
    notify_url: wx.notifyUrl,
    amount: {
      total: Math.round(amount * 100), // 转换为分
    },
    payer: {
      openid,
    },
  };

  try {
    const result = await pay.transactions_jsapi(params);
    console.log('[WechatPay] 创建订单成功:', orderNo);
    return result;
  } catch (error) {
    console.error('[WechatPay] 创建订单失败:', error.message);
    throw error;
  }
}

/**
 * 查询订单
 * @param {string} orderNo - 商户订单号
 * @returns {Promise<object>}
 */
async function queryOrder(orderNo) {
  const pay = getPayment();
  if (!pay) {
    throw new Error('微信支付未初始化');
  }

  try {
    const result = await pay.query({ out_trade_no: orderNo });
    return result;
  } catch (error) {
    console.error('[WechatPay] 查询订单失败:', error.message);
    throw error;
  }
}

/**
 * 关闭订单
 * @param {string} orderNo - 商户订单号
 * @returns {Promise<void>}
 */
async function closeOrder(orderNo) {
  const pay = getPayment();
  if (!pay) {
    throw new Error('微信支付未初始化');
  }

  try {
    await pay.close({ out_trade_no: orderNo });
    console.log('[WechatPay] 关闭订单成功:', orderNo);
  } catch (error) {
    console.error('[WechatPay] 关闭订单失败:', error.message);
    throw error;
  }
}

/**
 * 申请退款
 * @param {object} params
 * @param {string} params.orderNo - 商户订单号
 * @param {string} params.refundNo - 退款单号
 * @param {number} params.total - 原订单金额（分）
 * @param {number} params.refund - 退款金额（分）
 * @param {string} params.reason - 退款原因
 * @returns {Promise<object>}
 */
async function refund({ orderNo, refundNo, total, refund, reason }) {
  const pay = getPayment();
  if (!pay) {
    throw new Error('微信支付未初始化');
  }

  const params = {
    out_trade_no: orderNo,
    out_refund_no: refundNo,
    reason,
    amount: {
      total: Math.round(total * 100),
      refund: Math.round(refund * 100),
      currency: 'CNY',
    },
  };

  try {
    const result = await pay.refunds(params);
    console.log('[WechatPay] 申请退款成功:', refundNo);
    return result;
  } catch (error) {
    console.error('[WechatPay] 申请退款失败:', error.message);
    throw error;
  }
}

/**
 * 验证并解密回调通知
 * @param {object} headers - 请求头
 * @param {string} body - 请求体
 * @returns {object|null} - 解密后的数据，验证失败返回null
 */
function verifyNotify(headers, body) {
  const pay = getPayment();
  if (!pay) {
    console.error('[WechatPay] 微信支付未初始化');
    return null;
  }

  try {
    const result = pay.verifySign(headers, body);
    return result;
  } catch (error) {
    console.error('[WechatPay] 验证回调签名失败:', error.message);
    return null;
  }
}

module.exports = {
  initPayment,
  getPayment,
  createJsapiOrder,
  queryOrder,
  closeOrder,
  refund,
  verifyNotify,
};

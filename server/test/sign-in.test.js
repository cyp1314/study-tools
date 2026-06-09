const axios = require('axios');
const baseURL = 'http://localhost:3000/api/v1';

// 测试配置
const TEST_CONFIG = {
  // 微信登录测试code（需要从微信小程序获取）
  wxCode: '0f1N70ll2cTcRh496pml24WNa00N70lU', // 留空则使用测试路由
};

/**
 * 获取测试token
 */
async function getToken() {
  if (TEST_CONFIG.wxCode) {
    console.log('使用微信登录获取token...');
    try {
      const res = await axios.post(`${baseURL}/auth/login`, { code: TEST_CONFIG.wxCode });
      console.log('微信登录响应:', JSON.stringify(res.data, null, 2));
      if (res.data.code === 0 && res.data.data?.token) {
        console.log('微信登录成功，用户ID:', res.data.data.user.id);
        return res.data.data.token;
      }
    } catch (error) {
      console.error('微信登录失败:', error.response?.data?.message || error.message);
    }
  }

  console.log('使用测试路由（无需登录）...');
  return null; // 返回null表示使用测试路由
}

/**
 * 使用真实登录接口测试签到
 */
async function testSignInWithAuth(token) {
  console.log('\n=== 使用真实登录接口测试签到 ===\n');

  if (!token) {
    console.log('跳过此测试（未提供微信code）');
    return;
  }

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  try {
    // 1. 获取签到状态
    console.log('1. 获取签到状态...');
    const statusRes = await axios.get(`${baseURL}/point/signin/status`, config);
    console.log('签到状态:', JSON.stringify(statusRes.data, null, 2));

    // 2. 执行签到
    console.log('\n2. 执行签到...');
    const signInRes = await axios.post(`${baseURL}/point/signin`, {}, config);
    console.log('签到结果:', JSON.stringify(signInRes.data, null, 2));

    // 3. 再次获取状态
    console.log('\n3. 再次获取签到状态...');
    const statusRes2 = await axios.get(`${baseURL}/point/signin/status`, config);
    console.log('签到后状态:', JSON.stringify(statusRes2.data, null, 2));

  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

/**
 * 使用测试路由测试签到（无需登录）
 */
async function testSignInWithTestRoute() {
  console.log('\n=== 使用测试路由测试签到（无需登录） ===\n');

  try {
    // 1. 获取签到配置
    console.log('1. 获取签到配置...');
    const configRes = await axios.get(`${baseURL}/test/sign-in/config`);
    console.log('签到配置:', JSON.stringify(configRes.data, null, 2));

    // 2. 获取签到状态
    console.log('\n2. 获取签到状态...');
    const statusRes = await axios.get(`${baseURL}/test/sign-in/status`);
    console.log('签到状态:', JSON.stringify(statusRes.data, null, 2));

    // 3. 执行签到
    console.log('\n3. 执行签到...');
    const signInRes = await axios.get(`${baseURL}/test/sign-in`);
    console.log('签到结果:', JSON.stringify(signInRes.data, null, 2));

    // 4. 再次获取状态
    console.log('\n4. 再次获取签到状态...');
    const statusRes2 = await axios.get(`${baseURL}/test/sign-in/status`);
    console.log('签到后状态:', JSON.stringify(statusRes2.data, null, 2));

    // 5. 获取积分余额
    console.log('\n5. 获取积分余额...');
    const pointsRes = await axios.get(`${baseURL}/test/points`);
    console.log('积分余额:', JSON.stringify(pointsRes.data, null, 2));

  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

/**
 * 重置签到记录（用于测试）
 */
async function resetSignInRecords() {
  console.log('\n=== 重置测试用户签到记录 ===\n');

  try {
    const res = await axios.post(`${baseURL}/test/sign-in/reset`);
    console.log('重置结果:', res.data.message);
  } catch (error) {
    console.error('重置失败:', error.response?.data || error.message);
  }
}

/**
 * 测试充值积分功能
 */
async function testRecharge(token) {
  console.log('\n=== 测试充值积分功能 ===\n');

  if (!token) {
    console.log('跳过此测试（未提供微信code）');
    return;
  }

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  try {
    // 1. 获取充值套餐列表
    console.log('1. 获取充值套餐列表...');
    const packagesRes = await axios.get(`${baseURL}/point/recharge/packages`, config);
    console.log('充值套餐:', JSON.stringify(packagesRes.data, null, 2));

    // 2. 创建充值订单（使用第一个套餐）
    if (packagesRes.data.data && packagesRes.data.data.length > 0) {
      const packageId = packagesRes.data.data[0].id;
      console.log(`\n2. 创建充值订单（套餐ID: ${packageId}）...`);
      // 注意：需要传入openid才能调起微信支付
      const orderRes = await axios.post(`${baseURL}/point/recharge/create`, { packageId }, config);
      console.log('订单创建结果:', JSON.stringify(orderRes.data, null, 2));

      // 如果有paymentParams，说明微信支付创建成功
      if (orderRes.data.data?.paymentParams) {
        console.log('\n微信支付参数:', JSON.stringify(orderRes.data.data.paymentParams, null, 2));
        console.log('提示: 前端使用此参数调起微信支付');
      }

      // 3. 获取充值记录
      console.log('\n3. 获取充值记录...');
      const ordersRes = await axios.get(`${baseURL}/point/recharge/orders`, config);
      console.log('充值记录:', JSON.stringify(ordersRes.data, null, 2));
    } else {
      console.log('\n没有可用的充值套餐，跳过订单创建测试');
    }

  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

/**
 * 测试微信支付回调（模拟）
 */
async function testPayNotify() {
  console.log('\n=== 测试微信支付回调（模拟） ===\n');

  try {
    // 模拟微信支付回调数据
    const mockNotifyData = {
      out_trade_no: 'RC20260609123456ABCDEF', // 替换为实际订单号
      transaction_id: 'mock_transaction_id',
      trade_state: 'SUCCESS',
    };

    console.log('模拟回调数据:', JSON.stringify(mockNotifyData, null, 2));
    console.log('提示: 实际回调由微信服务器发起，此处仅作测试参考');

  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

// 执行测试
async function runTests() {
  console.log('=== 签到接口测试脚本 ===\n');

  // 如果提供了微信code，先进行微信登录测试
  const token = await getToken();

  // 使用测试路由测试（无需登录，推荐用于开发测试）
  await testSignInWithTestRoute();

  // 使用真实登录接口测试（需要微信code）
  await testSignInWithAuth(token);

  // 测试充值功能（需要微信code）
  await testRecharge(token);

  // 测试支付回调（模拟）
  await testPayNotify();

  console.log('\n=== 测试完成 ===');
}

// 运行测试
runTests();

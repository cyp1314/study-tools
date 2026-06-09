/**
 * API 日志功能测试脚本
 * 用于验证日志功能是否正常工作
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000/api/v1';

// 测试函数
async function testApiLog() {
  console.log('🧪 API 日志功能测试\n');

  // 1. 健康检查（无用户）
  console.log('1️⃣  测试健康检查接口（无用户）...');
  await makeRequest('GET', '/health');
  await sleep(500);

  // 2. 登录获取 token
  console.log('\n2️⃣  测试登录接口...');
  const loginResult = await makeRequest('POST', '/auth/login', {
    code: 'test_code_123',
  });
  
  let token = null;
  if (loginResult && loginResult.data && loginResult.data.token) {
    token = loginResult.data.token;
    console.log('✅ 登录成功，获取到 token');
  } else {
    console.log('⚠️  登录失败，继续测试其他接口');
  }

  // 3. 获取用户信息（有用户）
  if (token) {
    console.log('\n3️⃣  测试获取用户信息（有用户）...');
    await makeRequest('GET', '/user/profile', null, token);
    await sleep(500);
  }

  // 4. 获取图片类型列表
  console.log('\n4️⃣  测试获取图片类型...');
  await makeRequest('GET', '/image/types', null, token);
  await sleep(500);

  // 5. 测试错误接口
  console.log('\n5️⃣  测试错误接口（404）...');
  await makeRequest('GET', '/not-found', null, token);
  await sleep(500);

  console.log('\n✅ 测试完成！');
  console.log('\n📊 查看日志记录：');
  console.log('   1. 登录管理后台');
  console.log('   2. 访问：GET /api/v1/admin/api-log');
  console.log('   3. 或直接查询数据库：SELECT * FROM api_logs ORDER BY id DESC LIMIT 10;');
}

// 发起 HTTP 请求
function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`   ${method} ${path} - ${res.statusCode} - ${result.message || 'success'}`);
          resolve(result);
        } catch (e) {
          console.log(`   ${method} ${path} - ${res.statusCode}`);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.log(`   ❌ 请求失败: ${e.message}`);
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// 延迟函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 执行测试
testApiLog().catch(console.error);

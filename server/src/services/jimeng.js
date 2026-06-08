const axios = require('axios');
const crypto = require('crypto');
const config = require('../config');

const VOLC_VISUAL_HOST = 'visual.volcengineapi.com';
const VOLC_VISUAL_URL = `https://${VOLC_VISUAL_HOST}`;
const REQ_KEY = 'jimeng_seedream46_cvtob';

/**
 * 不参与加签过程的 header key
 */
const HEADER_KEYS_TO_IGNORE = new Set([
  'authorization',
  'content-type',
  'content-length',
  'user-agent',
  'presigned-expires',
  'expect',
]);

// ==================== 签名工具函数（参考 sl.js 官方示例）====================

function hmac(secret, s) {
  return crypto.createHmac('sha256', secret).update(s, 'utf8').digest();
}

function hash(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

function getBodySha(body) {
  const h = crypto.createHash('sha256');
  if (typeof body === 'string') {
    h.update(body);
  } else if (Buffer.isBuffer(body)) {
    h.update(body);
  }
  return h.digest('hex');
}

function getDateTimeNow() {
  return new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
}

function uriEscape(str) {
  try {
    return encodeURIComponent(str)
      .replace(/[^A-Za-z0-9_.~\-%]+/g, escape)
      .replace(/[*]/g, (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
  } catch (e) {
    return '';
  }
}

function queryParamsToString(params) {
  return Object.keys(params)
    .sort()
    .map((key) => {
      const val = params[key];
      if (typeof val === 'undefined' || val === null) {
        return undefined;
      }
      const escapedKey = uriEscape(key);
      if (!escapedKey) {
        return undefined;
      }
      if (Array.isArray(val)) {
        return `${escapedKey}=${val.map(uriEscape).sort().join(`&${escapedKey}=`)}`;
      }
      return `${escapedKey}=${uriEscape(val)}`;
    })
    .filter((v) => v)
    .join('&');
}

function getSignHeaders(originHeaders, needSignHeaders) {
  function trimHeaderValue(header) {
    return header.toString?.().trim().replace(/\s+/g, ' ') ?? '';
  }

  let h = Object.keys(originHeaders);
  if (Array.isArray(needSignHeaders)) {
    const needSignSet = new Set([...needSignHeaders, 'x-date', 'host'].map((k) => k.toLowerCase()));
    h = h.filter((k) => needSignSet.has(k.toLowerCase()));
  }
  h = h.filter((k) => !HEADER_KEYS_TO_IGNORE.has(k.toLowerCase()));
  const signedHeaderKeys = h
    .slice()
    .map((k) => k.toLowerCase())
    .sort()
    .join(';');
  const canonicalHeaders = h
    .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
    .map((k) => `${k.toLowerCase()}:${trimHeaderValue(originHeaders[k])}`)
    .join('\n');
  return [signedHeaderKeys, canonicalHeaders];
}

/**
 * 签名函数（完全按照 sl.js 官方示例实现）
 */
function sign(params) {
  const {
    headers = {},
    query = {},
    region = '',
    serviceName = '',
    method = '',
    pathName = '/',
    accessKeyId = '',
    secretAccessKey = '',
    needSignHeaderKeys = [],
    bodySha,
  } = params;

  const datetime = headers['X-Date'];
  const date = datetime.substring(0, 8); // YYYYMMDD

  // 创建正规化请求
  const [signedHeaders, canonicalHeaders] = getSignHeaders(headers, needSignHeaderKeys);
  const canonicalRequest = [
    method.toUpperCase(),
    pathName,
    queryParamsToString(query) || '',
    `${canonicalHeaders}\n`,
    signedHeaders,
    bodySha || hash(''),
  ].join('\n');

  const credentialScope = [date, region, serviceName, 'request'].join('/');

  // 创建签名字符串
  const stringToSign = ['HMAC-SHA256', datetime, credentialScope, hash(canonicalRequest)].join('\n');

  // 计算签名
  const kDate = hmac(secretAccessKey, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, serviceName);
  const kSigning = hmac(kService, 'request');
  const signature = hmac(kSigning, stringToSign).toString('hex');

  const authorization = [
    'HMAC-SHA256',
    `Credential=${accessKeyId}/${credentialScope},`,
    `SignedHeaders=${signedHeaders},`,
    `Signature=${signature}`,
  ].join(' ');

  return { authorization, canonicalRequest, stringToSign, signedHeaders };
}

// ==================== JimengService ====================

class JimengService {
  constructor() {
    this.accessKeyId = config.volc.accessKey;
    this.secretAccessKey = config.volc.secretKey;
    this.ready = !!(this.accessKeyId && this.secretAccessKey);
    if (!this.ready) {
      console.warn('[Jimeng] VOLC_ACCESS_KEY or VOLC_SECRET_KEY not configured');
    } else {
      console.log('[Jimeng] Service initialized, AK:', this.accessKeyId.substring(0, 8) + '...');
    }
  }

  _checkReady() {
    if (!this.ready) {
      throw new Error('即梦AI服务未配置，请检查VOLC_ACCESS_KEY和VOLC_SECRET_KEY');
    }
  }

  /**
   * 构建签名请求并发送（按 sl.js 官方签名逻辑）
   */
  async _request(action, body) {
    const bodyStr = JSON.stringify(body);
    const requestTime = new Date().toISOString();
    const xDate = getDateTimeNow();
    const bodySha = getBodySha(bodyStr);

    console.log(`[Jimeng] ======= ${action} =======`);
    console.log(`[Jimeng] Request time: ${requestTime}`);
    console.log(`[Jimeng] X-Date: ${xDate}`);
    console.log(`[Jimeng] Body SHA256: ${bodySha}`);
    console.log(`[Jimeng] Body: ${bodyStr.substring(0, 500)}${bodyStr.length > 500 ? '...(truncated)' : ''}`);

    // 构建 query 参数
    const query = {
      Action: action,
      Version: '2022-08-31',
    };
    // 正规化 query，防止值为 undefined
    for (const [key, val] of Object.entries(query)) {
      if (val === undefined || val === null) {
        query[key] = '';
      }
    }

    // 构建 headers
    const headers = {
      'X-Date': xDate,
      'Host': VOLC_VISUAL_HOST,
    };

    // 签名
    const signResult = sign({
      headers,
      query,
      region: 'cn-north-1',
      serviceName: 'cv',
      method: 'POST',
      pathName: '/',
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
      bodySha,
    });

    // 将签名放入 headers
    headers['Authorization'] = signResult.authorization;
    headers['Content-Type'] = 'application/json';

    console.log('[Jimeng] SignedHeaders:', signResult.signedHeaders);
    console.log('[Jimeng] Authorization:', signResult.authorization);
    console.log('[Jimeng] CanonicalRequest:\n', signResult.canonicalRequest);
    console.log('[Jimeng] StringToSign:\n', signResult.stringToSign);

    // 构建 URL（带 query 参数）
    const queryString = queryParamsToString(query);
    const fullUrl = `${VOLC_VISUAL_URL}/?${queryString}`;
    console.log('[Jimeng] Full URL:', fullUrl);
    console.log('[Jimeng] Request headers:', JSON.stringify(headers, null, 2));

    // 发送请求
    let response;
    try {
      response = await axios.post(fullUrl, bodyStr, {
        headers,
        timeout: 30000,
      });
    } catch (axiosErr) {
      console.error('[Jimeng] Axios request FAILED:');
      console.error('[Jimeng]   Message:', axiosErr.message);
      if (axiosErr.response) {
        console.error('[Jimeng]   HTTP Status:', axiosErr.response.status);
        console.error('[Jimeng]   Response Headers:', JSON.stringify(axiosErr.response.headers, null, 2));
        console.error('[Jimeng]   Response Data:', JSON.stringify(axiosErr.response.data, null, 2));
      } else if (axiosErr.request) {
        console.error('[Jimeng]   No response received (network error / timeout)');
      } else {
        console.error('[Jimeng]   Request config error:', axiosErr.message);
      }
      const statusInfo = axiosErr.response ? ` (HTTP ${axiosErr.response.status})` : '';
      const responseData = axiosErr.response?.data;
      const detailMsg = responseData ? `, detail: ${JSON.stringify(responseData)}` : '';
      throw new Error(`即梦AI请求失败: ${axiosErr.message}${statusInfo}${detailMsg}`);
    }

    console.log(`[Jimeng] Response HTTP status: ${response.status}`);
    const resDataStr = JSON.stringify(response.data, null, 2);
    console.log('[Jimeng] Response data:', resDataStr.substring(0, 2000) + (resDataStr.length > 2000 ? '...(truncated)' : ''));
    console.log(`[Jimeng] ======= ${action} END =======`);

    return response.data;
  }

  /**
   * 提交异步图片生成任务
   */
  async submitTask(params) {
    this._checkReady();

    const body = {
      req_key: REQ_KEY,
      prompt: params.prompt,
      force_single: true,
    };

    if (params.extra) {
      Object.assign(body, params.extra);
    }

    console.log('[Jimeng] Submit task params:');
    console.log('[Jimeng]   req_key:', REQ_KEY);
    console.log('[Jimeng]   prompt:', params.prompt.substring(0, 100) + (params.prompt.length > 100 ? '...' : ''));
    console.log('[Jimeng]   force_single: true');
    console.log('[Jimeng]   extra:', JSON.stringify(params.extra || {}));

    const res = await this._request('CVSync2AsyncSubmitTask', body);

    console.log('[Jimeng] Submit result - code:', res.code, ', message:', res.message);

    if (res.code !== 10000) {
      const errMsg = res.message || res.msg || JSON.stringify(res);
      console.error('[Jimeng] Submit FAILED! Full response:', JSON.stringify(res, null, 2));
      throw new Error(`即梦AI提交任务失败: code=${res.code}, message=${errMsg}`);
    }

    const taskId = res?.data?.task_id;
    if (!taskId) {
      console.error('[Jimeng] No task_id in response! Full data:', JSON.stringify(res.data, null, 2));
      throw new Error('即梦AI提交任务未返回task_id');
    }

    console.log('[Jimeng] Task submitted successfully, task_id:', taskId);
    return taskId;
  }

  /**
   * 查询异步任务结果
   */
  async getTaskResult(taskId, maxRetries = 30, interval = 2000) {
    this._checkReady();

    console.log(`[Jimeng] Start polling task_id: ${taskId}, maxRetries: ${maxRetries}, interval: ${interval}ms`);

    for (let i = 0; i < maxRetries; i++) {
      const body = {
        req_key: REQ_KEY,
        task_id: String(taskId),
        // req_json: "{\"return_url\":true}" // 配置返回base64图片还是url链接
      };

      const res = await this._request('CVSync2AsyncGetResult', body);

      if (res.code !== 10000) {
        console.error('[Jimeng] GetResult FAILED, code:', res.code, ', message:', res.message);
        console.error('[Jimeng] GetResult full response:', JSON.stringify(res, null, 2));
        throw new Error(`即梦AI查询任务失败: code=${res.code}, message=${res.message || 'unknown'}`);
      }

      const status = res?.data?.status;
      console.log(`[Jimeng] Poll #${i + 1}/${maxRetries}, task_id: ${taskId}, status: ${status}`);

      if (status === 'done') {
        const imageCount = res?.data?.binary_data_base64?.length || 0;
        const imageUrlCount = res?.data?.image_urls?.length || 0;
        console.log(`[Jimeng] Task DONE! task_id: ${taskId}, images: ${imageCount}, imageUrls: ${imageUrlCount}`);
        if (imageUrlCount > 0) {
          console.log('[Jimeng] Image URLs:', JSON.stringify(res.data.image_urls, null, 2));
        }
        return {
          status: 'success',
          images: res?.data?.binary_data_base64 || [],
          imageUrls: res?.data?.image_urls || [],
          taskId,
          raw: res.data,
        };
      }

      if (status === 'not_found') {
        console.error('[Jimeng] Task NOT FOUND, task_id:', taskId);
        throw new Error('即梦AI任务未找到，可能任务不存在或已过期');
      }

      if (status === 'expired') {
        console.error('[Jimeng] Task EXPIRED, task_id:', taskId);
        throw new Error('即梦AI任务已过期，请重新提交');
      }

      if (status === 'done' && res.code !== 10000) {
        console.error('[Jimeng] Task done but code error:', res.code, ', message:', res.message);
        throw new Error(`即梦AI生成失败: ${res.message || 'unknown'}`);
      }

      if (interval <= 0) {
        console.log('[Jimeng] Single query mode, returning status:', status);
        return { status, taskId };
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    console.error('[Jimeng] Polling TIMEOUT after', maxRetries, 'retries, task_id:', taskId);
    throw new Error('即梦AI生成超时，请稍后重试');
  }

  async generateImage(params, maxRetries = 30) {
    const taskId = await this.submitTask(params);
    return this.getTaskResult(taskId, maxRetries);
  }

  async textToImage(prompt, options = {}) {
    console.log('[Jimeng] textToImage called, prompt:', prompt.substring(0, 60) + '...');
    return this.generateImage({
      prompt,
      extra: {
        return_url: true,
        logo_info: { add_logo: false },
        ...options,
      },
    });
  }
}

module.exports = new JimengService();
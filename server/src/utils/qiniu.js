const qiniu = require('qiniu');
const crypto = require('crypto');
const config = require('../config');

/**
 * 七牛云上传工具类
 * 支持通过 Buffer / Base64 / 本地文件路径上传
 */
class QiniuUploader {
  constructor() {
    this.accessKey = config.qiniu.accessKey;
    this.secretKey = config.qiniu.secretKey;
    this.bucket = config.qiniu.bucket;
    this.domain = config.qiniu.domain;
    this.region = config.qiniu.region;

    this.ready = !!(this.accessKey && this.secretKey && this.bucket);
    if (!this.ready) {
      console.warn('[Qiniu] QINIU_ACCESS_KEY / SECRET_KEY / BUCKET not configured');
    } else {
      // 初始化 Mac 和 Config
      this.mac = new qiniu.auth.digest.Mac(this.accessKey, this.secretKey);
      this.qiniuConfig = new qiniu.conf.Config();
      // 设置存储区域
      this.qiniuConfig.zone = qiniu.zone[this.region] || qiniu.zone.Zone_z2;
      this.formUploader = new qiniu.form_up.FormUploader(this.qiniuConfig);
      this.putExtra = new qiniu.form_up.PutExtra();
      this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.qiniuConfig);
      console.log('[Qiniu] Uploader initialized, bucket:', this.bucket, ', region:', this.region);
    }
  }

  _checkReady() {
    if (!this.ready) {
      throw new Error('七牛云未配置，请检查QINIU_ACCESS_KEY、QINIU_SECRET_KEY和QINIU_BUCKET');
    }
  }

  /**
   * 生成上传凭证
   * @param {string} key - 文件名（可选，为空则由七牛自动生成）
   * @returns {string} uploadToken
   */
  getUploadToken(key) {
    this._checkReady();
    const options = key ? { scope: `${this.bucket}:${key}` } : { scope: this.bucket };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(this.mac);
  }

  /**
   * 生成唯一文件名
   * @param {string} prefix - 路径前缀（如 jimeng/coloringBook）
   * @param {string} ext - 文件扩展名（如 .png）
   * @returns {string} 文件名，如 jimeng/coloringBook/20260605/abc123.png
   */
  generateKey(prefix = 'jimeng', ext = '.png') {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const hash = crypto.randomBytes(8).toString('hex');
    return `${prefix}/${dateStr}/${hash}${ext}`;
  }

  /**
   * 生成私有下载/预览链接
   * @param {string} key - 文件key（上传时的key，如 jimeng/20260608/abc123.png）
   * @param {number} expires - 链接有效期（秒），默认1小时
   * @returns {string} 带签名的私有下载URL
   */
  getPrivateDownloadUrl(key, expires = 3600) {
    this._checkReady();
    const deadline = Math.floor(Date.now() / 1000) + expires;
    return this.bucketManager.privateDownloadUrl(this.domain, key, deadline);
  }

  /**
   * 批量生成私有下载/预览链接
   * @param {string[]} keys - 文件key数组
   * @param {number} expires - 链接有效期（秒），默认1小时
   * @returns {string[]} 带签名的私有下载URL数组
   */
  getPrivateDownloadUrls(keys, expires = 3600) {
    return keys.map((key) => this.getPrivateDownloadUrl(key, expires));
  }

  /**
   * 从完整URL中提取key
   * @param {string} url - 完整URL，如 http://domain.com/jimeng/20260608/abc.png
   * @returns {string} key，如 jimeng/20260608/abc.png
   */
  extractKeyFromUrl(url) {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      // 去掉开头的 /
      return urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
    } catch {
      // 如果不是完整URL，直接返回
      return url;
    }
  }

  /**
   * 上传 Buffer 到七牛云
   * @param {Buffer} buffer - 文件 Buffer
   * @param {string} key - 文件名
   * @returns {Promise<string>} 文件key（不再返回完整URL）
   */
  uploadBuffer(buffer, key) {
    this._checkReady();
    return new Promise((resolve, reject) => {
      const uploadToken = this.getUploadToken(key);
      this.formUploader.put(uploadToken, key, buffer, this.putExtra, (err, body, info) => {
        if (err) {
          console.error('[Qiniu] uploadBuffer FAILED:', err);
          return reject(new Error(`七牛云上传失败: ${err.message || err}`));
        }
        if (info.statusCode === 200) {
          console.log('[Qiniu] uploadBuffer SUCCESS, key:', key);
          resolve(key);
        } else {
          console.error('[Qiniu] uploadBuffer FAILED, statusCode:', info.statusCode, ', body:', body);
          reject(new Error(`七牛云上传失败: HTTP ${info.statusCode}, ${JSON.stringify(body)}`));
        }
      });
    });
  }

  /**
   * 上传 Base64 图片到七牛云
   * @param {string} base64Str - base64 编码的图片字符串（可带或不带 data:image/xxx;base64, 前缀）
   * @param {string} key - 文件名（可选，不传则自动生成）
   * @param {string} prefix - 路径前缀（自动生成key时使用）
   * @returns {Promise<string>} 文件key
   */
  async uploadBase64(base64Str, key, prefix = 'jimeng') {
    this._checkReady();

    // 去除 data:image/xxx;base64, 前缀
    const pureBase64 = base64Str.replace(/^data:image\/[\w+]+;base64,/, '');

    // Base64 解码为 Buffer
    const buffer = Buffer.from(pureBase64, 'base64');

    // 自动生成 key
    if (!key) {
      key = this.generateKey(prefix, '.png');
    }

    console.log(`[Qiniu] uploadBase64, key: ${key}, size: ${buffer.length} bytes`);
    return this.uploadBuffer(buffer, key);
  }

  /**
   * 上传本地文件到七牛云
   * @param {string} localFile - 本地文件路径
   * @param {string} key - 文件名（可选）
   * @param {string} prefix - 路径前缀
   * @returns {Promise<string>} 文件key
   */
  uploadFile(localFile, key, prefix = 'jimeng') {
    this._checkReady();
    if (!key) {
      key = this.generateKey(prefix);
    }
    return new Promise((resolve, reject) => {
      const uploadToken = this.getUploadToken(key);
      this.formUploader.putFile(uploadToken, key, localFile, this.putExtra, (err, body, info) => {
        if (err) {
          console.error('[Qiniu] uploadFile FAILED:', err);
          return reject(new Error(`七牛云上传失败: ${err.message || err}`));
        }
        if (info.statusCode === 200) {
          console.log('[Qiniu] uploadFile SUCCESS, key:', key);
          resolve(key);
        } else {
          console.error('[Qiniu] uploadFile FAILED, statusCode:', info.statusCode, ', body:', body);
          reject(new Error(`七牛云上传失败: HTTP ${info.statusCode}, ${JSON.stringify(body)}`));
        }
      });
    });
  }

  /**
   * 批量上传 Base64 图片
   * @param {string[]} base64List - base64 图片数组
   * @param {string} prefix - 路径前缀
   * @returns {Promise<string[]>} key 数组
   */
  async uploadBase64List(base64List, prefix = 'jimeng') {
    const results = [];
    for (let i = 0; i < base64List.length; i++) {
      try {
        const key = await this.uploadBase64(base64List[i], null, prefix);
        results.push(key);
      } catch (err) {
        console.error(`[Qiniu] uploadBase64List item ${i} FAILED:`, err.message);
        results.push(null);
      }
    }
    return results;
  }
}

module.exports = new QiniuUploader();

const fs = require('fs').promises;
const path = require('path');

/**
 * 本地图片存储工具
 * 将 base64 图片保存到本地文件系统
 */
class LocalImageStorage {
  constructor() {
    // 图片存储根目录
    this.baseDir = path.join(__dirname, '../../uploads/images');
    // 确保目录存在
    this.ensureDir();
  }

  /**
   * 确保存储目录存在
   */
  async ensureDir() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (err) {
      console.error('[LocalImageStorage] 创建目录失败:', err.message);
    }
  }

  /**
   * 生成唯一的文件名
   * @param {string} extension - 文件扩展名，如 'png', 'jpg'
   * @returns {string} 文件名
   */
  generateFileName(extension = 'png') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}_${random}.${extension}`;
  }

  /**
   * 从 base64 数据中提取图片类型
   * @param {string} base64Data - base64 字符串
   * @returns {string} 图片类型，如 'png', 'jpeg', 'jpg', 'webp'
   */
  getImageType(base64Data) {
    const match = base64Data.match(/^data:image\/(\w+);base64,/);
    if (match) {
      const type = match[1];
      // jpeg 统一转为 jpg
      return type === 'jpeg' ? 'jpg' : type;
    }
    return 'png'; // 默认 png
  }

  /**
   * 从 base64 数据中提取纯 base64 部分（去掉 data:image/xxx;base64, 前缀）
   * @param {string} base64Data - base64 字符串
   * @returns {string} 纯 base64 数据
   */
  extractBase64(base64Data) {
    const match = base64Data.match(/^data:image\/\w+;base64,(.+)$/);
    return match ? match[1] : base64Data;
  }

  /**
   * 保存 base64 图片到本地
   * @param {string} base64Data - base64 图片数据
   * @param {string} subDir - 子目录，如 'jimeng/coloringBook'
   * @returns {Promise<string>} 相对路径，如 'uploads/images/jimeng/coloringBook/123456_abc.png'
   */
  async saveBase64Image(base64Data, subDir = '') {
    try {
      // 提取图片类型
      const imageType = this.getImageType(base64Data);
      // 生成文件名
      const fileName = this.generateFileName(imageType);
      
      // 构建完整目录路径
      const fullDir = subDir 
        ? path.join(this.baseDir, subDir)
        : this.baseDir;
      
      // 确保子目录存在
      await fs.mkdir(fullDir, { recursive: true });
      
      // 提取纯 base64 数据
      const pureBase64 = this.extractBase64(base64Data);
      // 转换为 Buffer
      const buffer = Buffer.from(pureBase64, 'base64');
      
      // 完整文件路径
      const filePath = path.join(fullDir, fileName);
      
      // 写入文件
      await fs.writeFile(filePath, buffer);
      
      // 返回相对路径（用于存储到数据库）
      const relativePath = subDir 
        ? path.posix.join('uploads/images', subDir, fileName)
        : path.posix.join('uploads/images', fileName);
      
      console.log('[LocalImageStorage] 保存图片成功:', relativePath);
      return relativePath;
    } catch (err) {
      console.error('[LocalImageStorage] 保存图片失败:', err.message);
      throw err;
    }
  }

  /**
   * 批量保存 base64 图片列表
   * @param {string[]} base64List - base64 图片数组
   * @param {string} subDir - 子目录
   * @returns {Promise<string[]>} 相对路径数组
   */
  async saveBase64List(base64List, subDir = '') {
    if (!base64List || base64List.length === 0) {
      return [];
    }

    const paths = [];
    for (const base64Data of base64List) {
      try {
        const filePath = await this.saveBase64Image(base64Data, subDir);
        paths.push(filePath);
      } catch (err) {
        console.error('[LocalImageStorage] 批量保存失败:', err.message);
        paths.push(''); // 失败的空位占位
      }
    }
    return paths;
  }

  /**
   * 获取图片的完整路径
   * @param {string} relativePath - 相对路径
   * @returns {string} 完整路径
   */
  getFullPath(relativePath) {
    if (!relativePath) return '';
    // 如果已经是完整路径，直接返回
    if (path.isAbsolute(relativePath)) return relativePath;
    // 转换为完整路径
    return path.join(__dirname, '../..', relativePath);
  }

  /**
   * 生成图片的访问 URL
   * @param {string} relativePath - 相对路径
   * @param {string} baseUrl - 基础 URL，默认使用本地服务器
   * @returns {string} 完整的访问 URL
   */
  getPublicUrl(relativePath, baseUrl = 'http://localhost:3000') {
    if (!relativePath) return '';
    // 将路径中的反斜杠转为正斜杠（Windows 兼容）
    const normalizedPath = relativePath.replace(/\\/g, '/');
    return `${baseUrl}/${normalizedPath}`;
  }

  /**
   * 批量生成图片访问 URL
   * @param {string[]} paths - 相对路径数组
   * @param {string} baseUrl - 基础 URL
   * @returns {string[]} URL 数组
   */
  getPublicUrls(paths, baseUrl = 'http://localhost:3000') {
    if (!paths || !Array.isArray(paths)) return [];
    return paths
      .filter(Boolean)
      .map(p => this.getPublicUrl(p, baseUrl));
  }

  /**
   * 删除图片文件
   * @param {string} relativePath - 相对路径
   */
  async deleteImage(relativePath) {
    if (!relativePath) return;
    
    try {
      const fullPath = this.getFullPath(relativePath);
      await fs.unlink(fullPath);
      console.log('[LocalImageStorage] 删除图片成功:', relativePath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.warn('[LocalImageStorage] 图片不存在:', relativePath);
      } else {
        console.error('[LocalImageStorage] 删除图片失败:', err.message);
      }
    }
  }

  /**
   * 获取文件大小（字节）
   * @param {string} relativePath - 相对路径
   * @returns {Promise<number>} 文件大小
   */
  async getFileSize(relativePath) {
    try {
      const fullPath = this.getFullPath(relativePath);
      const stats = await fs.stat(fullPath);
      return stats.size;
    } catch (err) {
      console.error('[LocalImageStorage] 获取文件大小失败:', err.message);
      return 0;
    }
  }
}

module.exports = new LocalImageStorage();

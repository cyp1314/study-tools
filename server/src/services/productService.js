const BaseService = require('./base');

class ProductService extends BaseService {
  constructor() {
    super('products');
  }

  async getActiveList() {
    const [rows] = await this.pool.query(
      'SELECT * FROM products WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    return rows;
  }

  async getAllList() {
    const [rows] = await this.pool.query(
      'SELECT * FROM products ORDER BY sort_order ASC, id ASC'
    );
    return rows;
  }

  /**
   * 根据 type 查找产品（用于图片生成时构建提示词）
   */
  async findByType(type) {
    const [rows] = await this.pool.query(
      'SELECT * FROM products WHERE type = ? AND is_active = 1', [type]
    );
    return rows[0] || null;
  }

  /**
   * 构建完整提示词
   */
  buildPrompt(product, userInput) {
    const input = userInput || product.default_prompt || '';
    return `${product.prefix || ''}${input}${product.suffix || ''}`;
  }

  async createProduct(data) {
    const id = await this.create({
      name: data.name,
      type: data.type,
      prefix: data.prefix || '',
      suffix: data.suffix || '',
      default_prompt: data.defaultPrompt || '',
      description: data.description || '',
      cover_image: data.coverImage || '',
      sort_order: data.sortOrder || 0,
      is_active: data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
    });
    // 设置分类关联
    if (data.categoryIds && data.categoryIds.length > 0) {
      await this.setCategories(id, data.categoryIds);
    }
    return id;
  }

  async updateProduct(id, data) {
    const updates = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.type !== undefined) updates.type = data.type;
    if (data.prefix !== undefined) updates.prefix = data.prefix;
    if (data.suffix !== undefined) updates.suffix = data.suffix;
    if (data.defaultPrompt !== undefined) updates.default_prompt = data.defaultPrompt;
    if (data.description !== undefined) updates.description = data.description;
    if (data.coverImage !== undefined) updates.cover_image = data.coverImage;
    if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder;
    if (data.isActive !== undefined) updates.is_active = data.isActive ? 1 : 0;
    await this.update(id, updates);
    // 更新分类关联
    if (data.categoryIds !== undefined) {
      await this.setCategories(id, data.categoryIds);
    }
  }

  async toggleActive(id) {
    await this.pool.query(
      'UPDATE products SET is_active = 1 - is_active WHERE id = ?', [id]
    );
  }

  /**
   * 获取产品关联的分类ID列表
   */
  async getCategoryIds(productId) {
    const [rows] = await this.pool.query(
      'SELECT category_id FROM product_categories WHERE product_id = ?', [productId]
    );
    return rows.map(r => r.category_id);
  }

  /**
   * 设置产品的分类关联（全量覆盖）
   */
  async setCategories(productId, categoryIds) {
    await this.pool.query('DELETE FROM product_categories WHERE product_id = ?', [productId]);
    if (categoryIds.length > 0) {
      const values = categoryIds.map(cid => [productId, cid]);
      await this.pool.query(
        'INSERT INTO product_categories (product_id, category_id) VALUES ?',
        [values]
      );
    }
  }

  /**
   * 删除产品（含关联）
   */
  async deleteProduct(id) {
    await this.pool.query('DELETE FROM product_categories WHERE product_id = ?', [id]);
    await this.deleteById(id);
  }
}

module.exports = new ProductService();

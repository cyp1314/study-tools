const BaseService = require('./base');

class CategoryService extends BaseService {
  constructor() {
    super('categories');
  }

  async getActiveList() {
    const [rows] = await this.pool.query(
      'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    return rows;
  }

  async getAllList() {
    const [rows] = await this.pool.query(
      'SELECT * FROM categories ORDER BY sort_order ASC, id ASC'
    );
    return rows;
  }

  async createCategory(data) {
    return this.create({
      name: data.name,
      icon: data.icon || '',
      sort_order: data.sortOrder || 0,
      is_active: data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
    });
  }

  async updateCategory(id, data) {
    const updates = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.icon !== undefined) updates.icon = data.icon;
    if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder;
    if (data.isActive !== undefined) updates.is_active = data.isActive ? 1 : 0;
    await this.update(id, updates);
  }

  async toggleActive(id) {
    await this.pool.query(
      'UPDATE categories SET is_active = 1 - is_active WHERE id = ?', [id]
    );
  }

  /**
   * 获取某分类下的产品列表
   */
  async getProductsByCategoryId(categoryId) {
    const [rows] = await this.pool.query(
      `SELECT p.* FROM products p
       INNER JOIN product_categories pc ON p.id = pc.product_id
       WHERE pc.category_id = ? AND p.is_active = 1
       ORDER BY p.sort_order ASC, p.id ASC`,
      [categoryId]
    );
    return rows;
  }
}

module.exports = new CategoryService();

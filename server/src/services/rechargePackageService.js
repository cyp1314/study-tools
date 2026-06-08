const BaseService = require('./base');

class RechargePackageService extends BaseService {
  constructor() {
    super('recharge_packages');
  }

  /**
   * 获取所有启用的套餐（按 sort_order 排序）
   */
  async getActiveList() {
    const [rows] = await this.pool.query(
      'SELECT * FROM recharge_packages WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    return rows;
  }

  /**
   * 获取所有套餐（管理端，含禁用的）
   */
  async getAllList() {
    const [rows] = await this.pool.query(
      'SELECT * FROM recharge_packages ORDER BY sort_order ASC, id ASC'
    );
    return rows;
  }

  /**
   * 创建套餐
   */
  async createPackage(data) {
    return this.create({
      name: data.name,
      points: data.points,
      bonus: data.bonus || 0,
      amount: data.amount,
      sort_order: data.sortOrder || 0,
      is_active: data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
    });
  }

  /**
   * 更新套餐
   */
  async updatePackage(id, data) {
    const updates = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.points !== undefined) updates.points = data.points;
    if (data.bonus !== undefined) updates.bonus = data.bonus;
    if (data.amount !== undefined) updates.amount = data.amount;
    if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder;
    if (data.isActive !== undefined) updates.is_active = data.isActive ? 1 : 0;
    await this.update(id, updates);
  }

  /**
   * 切换启用/禁用
   */
  async toggleActive(id) {
    await this.pool.query(
      'UPDATE recharge_packages SET is_active = 1 - is_active WHERE id = ?',
      [id]
    );
  }
}

module.exports = new RechargePackageService();

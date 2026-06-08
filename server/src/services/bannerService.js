const BaseService = require('./base');

class BannerService extends BaseService {
  constructor() {
    super('banners');
  }

  async getActiveList() {
    const [rows] = await this.pool.query(
      'SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    return rows;
  }

  async getAllList() {
    const [rows] = await this.pool.query(
      'SELECT * FROM banners ORDER BY sort_order ASC, id ASC'
    );
    return rows;
  }

  async createBanner(data) {
    return this.create({
      title: data.title,
      image_key: data.imageKey || '',
      link_type: data.linkType || 'none',
      link_url: data.linkUrl || '',
      sort_order: data.sortOrder || 0,
      is_active: data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
    });
  }

  async updateBanner(id, data) {
    const updates = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.imageKey !== undefined) updates.image_key = data.imageKey;
    if (data.linkType !== undefined) updates.link_type = data.linkType;
    if (data.linkUrl !== undefined) updates.link_url = data.linkUrl;
    if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder;
    if (data.isActive !== undefined) updates.is_active = data.isActive ? 1 : 0;
    await this.update(id, updates);
  }

  async toggleActive(id) {
    await this.pool.query(
      'UPDATE banners SET is_active = 1 - is_active WHERE id = ?', [id]
    );
  }
}

module.exports = new BannerService();

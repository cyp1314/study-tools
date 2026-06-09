const pool = require('../db/mysql');

class BaseService {
  constructor(tableName) {
    this.tableName = tableName;
    this.pool = pool;
  }

  /**
   * 测试数据库连接
   */
  async testConnection() {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('[DB] Connection test failed:', error.message);
      return false;
    }
  }

  /**
   * 带重试的查询
   */
  async queryWithRetry(sql, values, retries = 3) {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        const [rows] = await this.pool.query(sql, values);
        return rows;
      } catch (error) {
        lastError = error;
        console.warn(`[DB] Query retry ${i + 1}/${retries} failed:`, error.message);
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1)));
        }
      }
    }
    throw lastError;
  }

  async findById(id) {
    const rows = await this.queryWithRetry(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return rows[0] || null;
  }

  async findAll(conditions = {}, page = 1, pageSize = 20) {
    let sql = `SELECT * FROM ${this.tableName}`;
    const values = [];
    const whereClauses = [];

    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        whereClauses.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    const offset = (page - 1) * pageSize;
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    values.push(pageSize, offset);

    const rows = await this.queryWithRetry(sql, values);
    return rows;
  }

  async count(conditions = {}) {
    let sql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
    const values = [];
    const whereClauses = [];

    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        whereClauses.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }
    console.log('[DB] Query:', sql, values);
    const rows = await this.queryWithRetry(sql, values);
    console.log('[DB] Result:', rows);
    return rows[0]?.total || 0;
  }

  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const result = await this.queryWithRetry(
      `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    );
    return result.insertId;
  }

  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClauses = keys.map((key) => `${key} = ?`).join(', ');
    await this.queryWithRetry(
      `UPDATE ${this.tableName} SET ${setClauses} WHERE id = ?`,
      [...values, id]
    );
  }

  async deleteById(id) {
    await this.queryWithRetry(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
  }
}

module.exports = BaseService;

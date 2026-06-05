const pool = require('../db/mysql');

class BaseService {
  constructor(tableName) {
    this.tableName = tableName;
    this.pool = pool;
  }

  async findById(id) {
    const [rows] = await this.pool.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
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

    const [rows] = await this.pool.query(sql, values);
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

    const [rows] = await this.pool.query(sql, values);
    return rows[0].total;
  }

  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const [result] = await this.pool.query(
      `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    );
    return result.insertId;
  }

  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClauses = keys.map((key) => `${key} = ?`).join(', ');
    await this.pool.query(
      `UPDATE ${this.tableName} SET ${setClauses} WHERE id = ?`,
      [...values, id]
    );
  }

  async deleteById(id) {
    await this.pool.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
  }
}

module.exports = BaseService;

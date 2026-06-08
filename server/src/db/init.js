const pool = require('./mysql');

async function initDatabase() {
  const connection = await pool.getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        openid VARCHAR(64) UNIQUE,
        nickname VARCHAR(50) DEFAULT '',
        avatar_url VARCHAR(255) DEFAULT '',
        role ENUM('parent','child') DEFAULT 'parent',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

  
    await connection.query(`
      CREATE TABLE IF NOT EXISTS image_records (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_input TEXT NOT NULL COMMENT '用户输入词',
        full_prompt TEXT NOT NULL COMMENT '完整提示词(prefix+userInput+suffix)',
        type VARCHAR(50) NOT NULL COMMENT '图片类型(coloringBook/sketchColoring等)',
        task_id VARCHAR(100) DEFAULT '' COMMENT '即梦AI任务ID',
        status ENUM('pending','generating','success','failed') DEFAULT 'pending' COMMENT '生成状态',
        images JSON COMMENT '即梦AI返回的base64图片列表',
        image_keys JSON COMMENT '七牛云图片key列表(用getPrivateDownloadUrl生成预览链接)',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        INDEX idx_type (type),
        INDEX idx_status (status),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Database tables initialized successfully');
  } finally {
    connection.release();
  }
}

module.exports = initDatabase;

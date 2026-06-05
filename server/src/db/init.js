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
      CREATE TABLE IF NOT EXISTS material_categories (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        type ENUM('coloring','writing','math','poetry','english','paper','activity') NOT NULL,
        icon VARCHAR(100) DEFAULT '',
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        category_id BIGINT,
        name VARCHAR(100) NOT NULL,
        type ENUM('svg','image','data') NOT NULL,
        url VARCHAR(255) DEFAULT '',
        content JSON,
        tags JSON,
        difficulty ENUM('easy','medium','hard') DEFAULT 'easy',
        age_range VARCHAR(20) DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category_id),
        INDEX idx_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS hanzi_strokes (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        character CHAR(1) UNIQUE NOT NULL,
        strokes JSON NOT NULL,
        stroke_count INT DEFAULT 0,
        stroke_order JSON,
        pinyin VARCHAR(10) DEFAULT '',
        radical VARCHAR(5) DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS poems (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(100) NOT NULL,
        author VARCHAR(50) DEFAULT '',
        dynasty VARCHAR(20) DEFAULT '',
        content JSON NOT NULL,
        grade VARCHAR(20) DEFAULT '',
        tags JSON,
        scene_image_url VARCHAR(255) DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_grade (grade)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS english_words (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        word VARCHAR(50) NOT NULL,
        phonetic VARCHAR(100) DEFAULT '',
        word_family VARCHAR(50) DEFAULT '',
        category VARCHAR(50) DEFAULT '',
        image_url VARCHAR(255) DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_family (word_family),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_works (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        type VARCHAR(30) NOT NULL,
        material_id BIGINT,
        image_url VARCHAR(255) DEFAULT '',
        params JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS error_books (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        subject VARCHAR(30) DEFAULT '',
        question JSON NOT NULL,
        answer JSON,
        ai_analysis TEXT,
        similar_questions JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS reward_records (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        work_id BIGINT,
        points INT DEFAULT 0,
        reason VARCHAR(100) DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Database tables initialized successfully');
  } finally {
    connection.release();
  }
}

module.exports = initDatabase;

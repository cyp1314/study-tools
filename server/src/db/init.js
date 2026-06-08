const pool = require('./mysql');

async function initDatabase() {
  const connection = await pool.getConnection();

  try {
    // ==================== 用户表 ====================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        openid VARCHAR(64) UNIQUE,
        unionid VARCHAR(64) DEFAULT '',
        nickname VARCHAR(50) DEFAULT '',
        avatar_url VARCHAR(255) DEFAULT '',
        phone VARCHAR(20) DEFAULT '',
        session_key VARCHAR(128) DEFAULT '',
        role ENUM('parent','child') DEFAULT 'parent',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // ==================== 图片记录表 ====================
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

    // ==================== 用户积分表 ====================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_points (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL UNIQUE COMMENT '用户ID',
        balance INT NOT NULL DEFAULT 0 COMMENT '当前积分余额',
        total_earned INT NOT NULL DEFAULT 0 COMMENT '累计获得积分',
        total_spent INT NOT NULL DEFAULT 0 COMMENT '累计消耗积分',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // ==================== 积分变更记录表 ====================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS point_logs (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL COMMENT '用户ID',
        type ENUM('sign_in','recharge','generate','admin_adjust','new_user','other') NOT NULL COMMENT '变更类型',
        amount INT NOT NULL COMMENT '变更数量(正=获得,负=消耗)',
        balance_after INT NOT NULL COMMENT '变更后余额',
        remark VARCHAR(255) DEFAULT '' COMMENT '备注(如签到第3天/生成涂色绘本)',
        ref_id VARCHAR(100) DEFAULT '' COMMENT '关联业务ID(如image_records.id)',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_type (type),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // ==================== 签到记录表 ====================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sign_in_records (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL COMMENT '用户ID',
        sign_date DATE NOT NULL COMMENT '签到日期',
        continuous_days INT NOT NULL DEFAULT 1 COMMENT '当前连续签到天数',
        earned_points INT NOT NULL DEFAULT 0 COMMENT '本次获得积分',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_date (user_id, sign_date),
        INDEX idx_user (user_id),
        INDEX idx_date (sign_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // ==================== 签到奖励配置表 ====================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sign_in_config (
        id INT PRIMARY KEY AUTO_INCREMENT,
        continuous_days INT NOT NULL COMMENT '连续第N天',
        reward_points INT NOT NULL COMMENT '奖励积分',
        is_active TINYINT DEFAULT 1 COMMENT '是否启用',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_days (continuous_days)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 插入默认签到配置（仅首次）
    const [rows] = await connection.query('SELECT COUNT(*) as cnt FROM sign_in_config');
    if (rows[0].cnt === 0) {
      await connection.query(`
        INSERT INTO sign_in_config (continuous_days, reward_points) VALUES
        (1, 5), (2, 10), (3, 15), (4, 20), (5, 25), (6, 35), (7, 50)
      `);
      console.log('[DB] Default sign-in config inserted');
    }

    // ==================== 充值订单表 ====================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recharge_orders (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL COMMENT '用户ID',
        order_no VARCHAR(64) NOT NULL UNIQUE COMMENT '订单号',
        points INT NOT NULL COMMENT '充值积分数',
        amount DECIMAL(10,2) NOT NULL COMMENT '支付金额(元)',
        status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
        payment_method VARCHAR(30) DEFAULT '' COMMENT '支付方式(wechat等)',
        paid_at DATETIME DEFAULT NULL COMMENT '支付时间',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_order (order_no),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('Database tables initialized successfully');
  } finally {
    connection.release();
  }
}

module.exports = initDatabase;

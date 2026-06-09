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
        role ENUM('user','admin') DEFAULT 'user',
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

    // ==================== 充值套餐配置表 ====================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS recharge_packages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL COMMENT '套餐名称',
        points INT NOT NULL COMMENT '积分数',
        bonus INT NOT NULL DEFAULT 0 COMMENT '赠送积分',
        amount DECIMAL(10,2) NOT NULL COMMENT '价格(元)',
        sort_order INT NOT NULL DEFAULT 0 COMMENT '排序(越小越靠前)',
        is_active TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 插入默认充值套餐（仅首次）
    const [pkgRows] = await connection.query('SELECT COUNT(*) as cnt FROM recharge_packages');
    if (pkgRows[0].cnt === 0) {
      await connection.query(`
        INSERT INTO recharge_packages (name, points, bonus, amount, sort_order) VALUES
        ('100积分', 100, 0, 9.90, 1),
        ('500积分', 500, 50, 39.90, 2),
        ('1000积分', 1000, 150, 69.90, 3),
        ('3000积分', 3000, 500, 179.90, 4)
      `);
      console.log('[DB] Default recharge packages inserted');
    }

    // ==================== 轮播图表 ====================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(100) NOT NULL COMMENT '标题',
        image_key VARCHAR(255) DEFAULT '' COMMENT '七牛云图片key',
        link_type ENUM('page','web','none') DEFAULT 'none' COMMENT '跳转类型',
        link_url VARCHAR(255) DEFAULT '' COMMENT '跳转地址(小程序页面路径或URL)',
        sort_order INT NOT NULL DEFAULT 0 COMMENT '排序(越小越靠前)',
        is_active TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // ==================== 分类表 ====================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL COMMENT '分类名称',
        icon VARCHAR(100) DEFAULT '' COMMENT '图标',
        sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
        is_active TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // ==================== 产品表 ====================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL COMMENT '产品名称',
        type VARCHAR(50) NOT NULL UNIQUE COMMENT '产品类型标识(如coloringBook)',
        prefix TEXT COMMENT '提示词前缀',
        suffix TEXT COMMENT '提示词后缀',
        default_prompt VARCHAR(255) DEFAULT '' COMMENT '默认提示词',
        description VARCHAR(255) DEFAULT '' COMMENT '产品描述',
        cover_image VARCHAR(255) DEFAULT '' COMMENT '产品图标',
        sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
        is_active TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // ==================== 产品-分类关联表 ====================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL COMMENT '产品ID',
        category_id INT NOT NULL COMMENT '分类ID',
        UNIQUE KEY uk_product_category (product_id, category_id),
        INDEX idx_product (product_id),
        INDEX idx_category (category_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 插入默认分类
    const [catRows] = await connection.query('SELECT COUNT(*) as cnt FROM categories');
    if (catRows[0].cnt === 0) {
      await connection.query(`
        INSERT INTO categories (name, icon, sort_order) VALUES
        ('涂色画', 'brush', 1),
        ('书法字帖', 'edit', 2),
        ('诗词插画', 'picture', 3),
        ('英语学习', 'chat-dot-round', 4),
        ('数学练习', 'sunny', 5),
        ('拼音练习', 'reading', 6),
        ('趣味游戏', 'gamepad', 7)
      `);
      console.log('[DB] Default categories inserted');
    }

    // 插入默认产品（来自 prompts.js）
    const [prodRows] = await connection.query('SELECT COUNT(*) as cnt FROM products');
    if (prodRows[0].cnt === 0) {
      const CONSTRAINTS_LINE_ART = '严格限制：整幅画只能由黑色线条构成，不允许出现任何涂黑、填充、色块、阴影、灰度或底色，线条内部和线条之间全部保持纯白色，整幅画只有两种东西：黑色轮廓线条+白色背景。';
      const CONSTRAINTS_THUMBNAIL = '左上角缩略图可以有颜色，中间大面积区域必须完全是「线条+白底」，缩略图和中间区域内容严格保持一致。';
      const CONSTRAINTS_LINE_QUALITY = '线条清晰、加粗、无断点。';
      const CONSTRAINTS_NO_DECORATION = '不要文字、字母、数字、水印或任何装饰。适合A4纸打印。';
      const CONSTRAINTS_SKETCH_ART = '严格限制：中间素描线稿只能由灰色和黑色线条构成，不允许出现任何大面积涂黑、填充色块或彩色，线条内部和线条之间全部保持纯白色，整幅画只有铅笔线条+白色背景。';

      await connection.query(`
        INSERT INTO products (name, type, prefix, suffix, default_prompt, description, sort_order) VALUES
        ('涂色绘本', 'coloringBook', '请生成一张A4竖版儿童涂色活动页。主题是关于：', '。左上角有一个小缩略图，里面是已经完整涂好颜色的图案，颜色鲜艳饱满。正中间是同一幅图案的纯黑色线条稿。${CONSTRAINTS_LINE_ART}${CONSTRAINTS_THUMBNAIL}${CONSTRAINTS_LINE_QUALITY}白色背景。${CONSTRAINTS_NO_DECORATION}', '一只可爱的小兔子在花园里', '涂色绘本 - 生成黑白线稿供儿童涂色', 1),
        ('素描涂色', 'sketchColoring', '请生成一张A4竖版素描涂色活动页。主题是关于：', '。左上角有一个小缩略图，里面是已经完整涂好颜色的图案，色彩自然柔和。正中间是同一幅图案的铅笔素描线稿，笔触自然灵动，线条有粗细变化。${CONSTRAINTS_SKETCH_ART}${CONSTRAINTS_THUMBNAIL}线条清晰、有素描笔触质感、无断点。白色背景。${CONSTRAINTS_NO_DECORATION}', '一座美丽的城堡', '素描涂色 - 生成素描风格线稿供涂色', 2),
        ('对称画', 'symmetryDrawing', '请生成一张A4竖版对称涂色活动页。主题是关于：', '。左上角有一个小缩略图，里面是已经完整涂好颜色的对称图案，颜色鲜艳饱满。正中间是同一幅图案的纯黑色对称线稿，左右严格镜像对称。${CONSTRAINTS_LINE_ART}${CONSTRAINTS_THUMBNAIL}线条清晰、加粗、无断点、对称精确。白色背景。${CONSTRAINTS_NO_DECORATION}', '蝴蝶花纹对称图案', '对称画/镜像涂色 - 生成对称图案线稿', 3),
        ('汉字字帖', 'hanziCopybook', '请生成一张A4竖版汉字字帖练习页。练习的汉字是：', '。排版要求：页面顶部是田字格中的示范字，用黑色粗体楷书书写，清晰标准；中间是描红格，示范字用浅灰色显示供描写；下方是3-4个空白田字格供独立书写。严格限制：每个田字格必须有完整的红色虚线十字格（横中线和竖中线），格子大小适中、排列整齐，汉字笔画规范、结构端正。白色背景，黑色文字，红色田字格辅助线。不要图片、插画、水印或任何装饰。适合A4纸打印。', '汉字"大"的字帖', '汉字字帖 - 生成田字格字帖', 4),
        ('古诗词配图', 'poemIllustration', '请生成一张A4竖版古诗词意境插画。诗词意境是：', '。风格要求：中国传统水墨画风格，淡雅含蓄，笔意流畅，大量留白，墨色浓淡相宜。画面要准确传达诗词的意境和情感，景物与诗意呼应。严格限制：纯水墨画风格，不使用鲜艳色彩，以墨色为主可点缀淡彩，构图简洁有留白。白色背景。不要现代元素、卡通风格、文字标注、水印或任何装饰。适合A4纸打印。', '床前明月光的意境', '古诗词配图 - 生成与诗词意境匹配的插画', 5),
        ('英语闪卡', 'englishFlashcard', '请生成一张A4竖版儿童英语单词闪卡。单词是：', '。布局要求：页面正中间是一幅与单词含义对应的卡通插画，占据画面大部分空间，插画下方用大号英文字母清晰标注单词拼写。风格要求：卡通风格，线条圆润可爱，色彩明亮饱满，形象生动易辨认，适合3-8岁儿童。白色背景。不要多余文字、拼音标注、水印或任何装饰。适合A4纸打印。', 'apple 苹果', '英语单词闪卡 - 生成单词配图闪卡', 6),
        ('数学练习', 'mathWorksheet', '请生成一张A4竖版儿童数学练习题页面。练习内容是：', '。排版要求：题目整齐排列，每行3-4题，数字和运算符号用大号字体清晰显示，题目之间间距适中，留出足够的答题书写空间。页面顶部有标题栏。严格限制：纯数学题目排版，不出现插画、卡通装饰或多余图案，数字清晰规范、大小一致，等号对齐。白色背景，黑色文字。不要水印或任何装饰。适合A4纸打印。', '10以内加减法练习', '数学练习 - 生成数学练习题图片', 7),
        ('拼音练习', 'pinyinWorksheet', '请生成一张A4竖版汉语拼音练习页。练习内容是：', '。排版要求：每个拼音字母在标准四线三格中书写，顶部是示范拼音用深色显示，中间是描红格用浅色供描写，下方是2-3个空白四线三格供独立书写。严格限制：四线三格辅助线必须清晰完整（上格线、中线、下格线、底线），拼音字母书写规范、占位准确，大小适中排列整齐。白色背景，黑色拼音字母，浅蓝色辅助线。不要插画、卡通装饰、水印或任何装饰。适合A4纸打印。', '声母b p m f的拼音练习', '拼音练习 - 生成拼音练习页', 8),
        ('迷宫游戏', 'mazeGame', '请生成一张A4竖版儿童迷宫游戏页面。迷宫主题是：', '。迷宫要求：起点在左上角用绿色圆点标记，终点在右下角用红色星星标记，路径宽度适中适合儿童手指或铅笔通过，墙壁用粗黑色线条绘制，至少有一条从起点到终点的通路。严格限制：迷宫只能由黑色线条墙壁+白色通道构成，不允许出现彩色填充、阴影或3D效果，通道内部全部保持纯白色。${CONSTRAINTS_LINE_QUALITY}白色背景。不要文字说明、水印或任何装饰。适合A4纸打印。', '从左上角到右下角的简单迷宫', '迷宫游戏 - 生成可打印的迷宫', 9),
        ('连线游戏', 'connectDots', '请生成一张A4竖版儿童连线游戏页面。连线图案是：', '。游戏要求：页面上有15-25个编号圆点，按数字1、2、3…顺序依次连线后可形成目标图案的轮廓。每个圆点旁标注清晰的小号数字，点与点间距适中，连线顺序从左到右、从上到下，连线后图案居中显示。严格限制：画面只能由编号圆点+数字+白色背景构成，不允许出现已连好的线、填充色块或阴影，圆点用小黑点表示。白色背景。不要额外图案提示、水印或任何装饰。适合A4纸打印。', '连出一个星星的形状', '连线游戏 - 生成按数字连线图片', 10),
        ('找不同', 'findDifference', '请生成一张A4竖版儿童找不同游戏页面。场景是：', '。游戏要求：页面上方和下方各有一张几乎完全相同的场景图，两图之间有5处细微差异。差异类型包括：某物体颜色不同、某物体缺失、某物体大小不同、某物体位置偏移等。差异要隐藏得自然巧妙，不能太明显也不能太难发现。严格限制：两张图大小一致、左右对齐，整体画风和色彩完全统一，只在指定的5处存在差异。不要用红圈标注差异位置，不要文字提示、水印或任何装饰。适合A4纸打印。', '公园场景中有5处不同', '找不同 - 生成找不同游戏图片', 11),
        ('涂色画板', 'customColoring', '请生成一张A4竖版儿童涂色线稿。图案主题是：', '。画面居中，图案尺寸适中占据大部分页面。${CONSTRAINTS_LINE_ART}${CONSTRAINTS_LINE_QUALITY}细节丰富适合涂色。白色背景。${CONSTRAINTS_NO_DECORATION}', '一只恐龙', '涂色画板 - 生成自定义主题的涂色线稿', 12)
      `);
      console.log('[DB] Default products inserted');

      // 默认产品-分类关联
      // 分类ID: 1=涂色画 2=书法字帖 3=诗词插画 4=英语学习 5=数学练习 6=拼音练习 7=趣味游戏
      await connection.query(`
        INSERT INTO product_categories (product_id, category_id) VALUES
        (1, 1), (2, 1), (3, 1), (12, 1),
        (4, 2),
        (5, 3),
        (6, 4),
        (7, 5),
        (8, 6),
        (9, 7), (10, 7), (11, 7)
      `);
      console.log('[DB] Default product-category relations inserted');
    }

    // ==================== 管理员账号表 ====================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
        password VARCHAR(255) NOT NULL COMMENT '密码(Bcrypt加密)',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 插入默认管理员账号（用户名: admin, 密码: 123456）
    const [adminRows] = await connection.query('SELECT COUNT(*) as cnt FROM admins');
    if (adminRows[0].cnt === 0) {
      // 密码: 123456 使用 bcrypt 加密
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('123456', 10);
      await connection.query(`INSERT INTO admins (username, password) VALUES (?, ?)`, ['admin', hashedPassword]);
      console.log('[DB] Default admin account inserted');
    }

    // ==================== API 调用日志表 ====================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS api_logs (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT DEFAULT NULL COMMENT '用户ID(未登录为NULL)',
        user_info JSON COMMENT '用户信息(昵称、头像等)',
        method VARCHAR(10) NOT NULL COMMENT 'HTTP方法',
        url VARCHAR(500) NOT NULL COMMENT '请求URL',
        query_params JSON COMMENT '查询参数',
        request_body JSON COMMENT '请求体',
        response_status INT NOT NULL COMMENT '响应状态码',
        response_body JSON COMMENT '响应体',
        response_time INT NOT NULL COMMENT '响应时长(毫秒)',
        ip_address VARCHAR(50) DEFAULT '' COMMENT '客户端IP',
        user_agent VARCHAR(500) DEFAULT '' COMMENT 'User-Agent',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        INDEX idx_user (user_id),
        INDEX idx_method (method),
        INDEX idx_url (url(255)),
        INDEX idx_status (response_status),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='API调用日志表';
    `);

    console.log('Database tables initialized successfully');
  } finally {
    connection.release();
  }
}

module.exports = initDatabase;

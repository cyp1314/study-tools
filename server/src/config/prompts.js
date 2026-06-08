/**
 * 即梦AI 提示词配置
 *
 * 每个功能模块的提示词由以下部分组成：
 * - prefix: 前缀（固定不变，控制风格和质量）
 * - suffix: 后缀（固定不变，控制输出格式和细节）
 * - defaultPrompt: 默认提示词（用户未提供时使用）
 *
 * 最终 prompt = prefix + userPrompt + suffix
 */

const promptConfig = {
  // ==================== 涂色绘本 (F01) ====================
  coloringBook: {
    prefix: '儿童涂色绘本风格，黑白线稿，清晰的轮廓线条，无阴影无填色，适合儿童涂色，',
    suffix: '，简洁粗线条勾勒，白色背景，无灰色填充，适合A4纸打印的高清线稿',
    defaultPrompt: '一只可爱的小兔子在花园里',
    description: '涂色绘本 - 生成黑白线稿供儿童涂色',
    buildPrompt(userInput) {
      const prompt = `${this.prefix}${userInput}${this.suffix}`;
      return prompt;
    },
  },

  // ==================== 素描涂色 (F02) ====================
  sketchColoring: {
    prefix: '素描风格涂色线稿，铅笔素描轮廓，干净的线条，无阴影纯线稿，',
    suffix: '，素描线条清晰，无灰色填充，白色背景，适合A4纸打印的高清线稿',
    defaultPrompt: '一座美丽的城堡',
    description: '素描涂色 - 生成素描风格线稿供涂色',
    buildPrompt(userInput) {
      const prompt = `${this.prefix}${userInput}${this.suffix}`;
      return prompt;
    },
  },

  // ==================== 对称画/镜像涂色 (F10) ====================
  symmetryDrawing: {
    prefix: '对称图案涂色线稿，左右完全对称，曼陀罗风格，精细的对称花纹，',
    suffix: '，对称线稿清晰，无填色，白色背景，适合A4纸打印的高清线稿',
    defaultPrompt: '蝴蝶花纹对称图案',
    description: '对称画/镜像涂色 - 生成对称图案线稿',
    buildPrompt(userInput) {
      const prompt = `${this.prefix}${userInput}${this.suffix}`;
      return prompt;
    },
  },

  // ==================== 汉字字帖 (F03) ====================
  hanziCopybook: {
    prefix: '汉字字帖练习页，田字格样式，',
    suffix: '，田字格标准格式，示范字+描红+空白练习格，白色背景，适合A4纸打印',
    defaultPrompt: '汉字"大"的字帖',
    description: '汉字字帖 - 生成田字格字帖',
    buildPrompt(userInput) {
      const prompt = `${this.prefix}${userInput}${this.suffix}`;
      return prompt;
    },
  },

  // ==================== 古诗词配图 (F05) ====================
  poemIllustration: {
    prefix: '中国古典水墨画风格，古诗词意境插画，传统中国画，',
    suffix: '，诗意意境，淡雅色彩，留白构图，适合A4纸打印',
    defaultPrompt: '床前明月光的意境',
    description: '古诗词配图 - 生成与诗词意境匹配的插画',
    buildPrompt(userInput) {
      const prompt = `${this.prefix}${userInput}${this.suffix}`;
      return prompt;
    },
  },

  // ==================== 英语单词闪卡 (F07) ====================
  englishFlashcard: {
    prefix: '儿童英语单词闪卡，卡通插画风格，简洁明了，',
    suffix: '，明亮的色彩，可爱的卡通风格，白色背景，适合A4纸打印',
    defaultPrompt: 'apple 苹果',
    description: '英语单词闪卡 - 生成单词配图闪卡',
    buildPrompt(userInput) {
      const prompt = `${this.prefix}${userInput}${this.suffix}`;
      return prompt;
    },
  },

  // ==================== 数学练习 (F14) ====================
  mathWorksheet: {
    prefix: '儿童数学练习题排版，清晰的数学题目布局，',
    suffix: '，整齐的题目排列，适合儿童书写的大字体，白色背景，适合A4纸打印',
    defaultPrompt: '10以内加减法练习',
    description: '数学练习 - 生成数学练习题图片',
    buildPrompt(userInput) {
      const prompt = `${this.prefix}${userInput}${this.suffix}`;
      return prompt;
    },
  },

  // ==================== 拼音练习 (F15) ====================
  pinyinWorksheet: {
    prefix: '汉语拼音练习页，清晰的拼音四线三格，',
    suffix: '，标准四线三格格式，大字体，白色背景，适合A4纸打印',
    defaultPrompt: '声母b p m f的拼音练习',
    description: '拼音练习 - 生成拼音练习页',
    buildPrompt(userInput) {
      const prompt = `${this.prefix}${userInput}${this.suffix}`;
      return prompt;
    },
  },

  // ==================== 迷宫游戏 (F18) ====================
  mazeGame: {
    prefix: '儿童迷宫游戏，清晰的迷宫路径，有趣的起点和终点标记，',
    suffix: '，适合儿童难度，粗线条路径，白色背景，适合A4纸打印',
    defaultPrompt: '从左上角到右下角的简单迷宫',
    description: '迷宫游戏 - 生成可打印的迷宫',
    buildPrompt(userInput) {
      const prompt = `${this.prefix}${userInput}${this.suffix}`;
      return prompt;
    },
  },

  // ==================== 连线游戏 (F19) ====================
  connectDots: {
    prefix: '儿童连线游戏，按数字顺序连线，清晰的数字标记点，',
    suffix: '，数字标记清晰，点与点间距适中，白色背景，适合A4纸打印',
    defaultPrompt: '连出一个星星的形状',
    description: '连线游戏 - 生成按数字连线图片',
    buildPrompt(userInput) {
      const prompt = `${this.prefix}${userInput}${this.suffix}`;
      return prompt;
    },
  },

  // ==================== 找不同 (F20) ====================
  findDifference: {
    prefix: '儿童找不同游戏，两张几乎相同的图片并排排列，有几处细微差异，',
    suffix: '，两张图并排，整体画风一致，差异隐藏自然，白色背景，适合A4纸打印',
    defaultPrompt: '公园场景中有5处不同',
    description: '找不同 - 生成找不同游戏图片',
    buildPrompt(userInput) {
      const prompt = `${this.prefix}${userInput}${this.suffix}`;
      return prompt;
    },
  },

  // ==================== 涂色画板（自定义涂色）(F27) ====================
  customColoring: {
    prefix: '儿童涂色线稿，干净的黑白轮廓，',
    suffix: '，清晰线稿无填色，白色背景，适合A4纸打印的高清线稿',
    defaultPrompt: '一只恐龙',
    description: '涂色画板 - 生成自定义主题的涂色线稿',
    buildPrompt(userInput) {
      const prompt = `${this.prefix}${userInput}${this.suffix}`;
      return prompt;
    },
  },

  // ==================== 通用图片生成 ====================
  general: {
    prefix: '',
    suffix: '，高清画质，适合A4纸打印',
    defaultPrompt: '',
    description: '通用图片生成 - 不添加额外提示词修饰',
    buildPrompt(userInput) {
      return userInput;
    },
  },
};

/**
 * 获取指定类型的提示词配置
 * @param {string} type - 功能类型
 * @returns {Object}
 */
function getPromptConfig(type) {
  const cfg = promptConfig[type];
  if (!cfg) {
    throw new Error(`未找到提示词配置: ${type}，可用类型: ${Object.keys(promptConfig).join(', ')}`);
  }
  return cfg;
}

/**
 * 构建完整提示词
 * @param {string} type - 功能类型
 * @param {string} userInput - 用户输入的提示词
 * @returns {{ prompt: string }}
 */
function buildPrompt(type, userInput) {
  const cfg = getPromptConfig(type);
  const prompt = cfg.buildPrompt(userInput || cfg.defaultPrompt);
  return { prompt };
}

module.exports = {
  promptConfig,
  getPromptConfig,
  buildPrompt,
};

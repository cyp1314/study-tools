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

// ==================== 公共约束片段 ====================
const CONSTRAINTS = {
  /** 涂色线稿通用严格限制（黑线+白底，无填充无阴影） */
  LINE_ART: '严格限制：整幅画只能由黑色线条构成，不允许出现任何涂黑、填充、色块、阴影、灰度或底色，线条内部和线条之间全部保持纯白色，整幅画只有两种东西：黑色轮廓线条+白色背景。',
  /** 素描线稿严格限制（灰黑线条+白底，无填充色块） */
  SKETCH_ART: '严格限制：中间素描线稿只能由灰色和黑色线条构成，不允许出现任何大面积涂黑、填充色块或彩色，线条内部和线条之间全部保持纯白色，整幅画只有铅笔线条+白色背景。',
  /** 缩略图+线稿双区域布局（涂色类通用） */
  THUMBNAIL_LAYOUT: '左上角缩略图可以有颜色，中间大面积区域必须完全是「线条+白底」，缩略图和中间区域内容严格保持一致。',
  /** 通用禁止项（不要文字/字母/数字/水印/装饰） */
  NO_DECORATION: '不要文字、字母、数字、水印或任何装饰。适合A4纸打印。',
  /** 线条质量要求（清晰、加粗、无断点） */
  LINE_QUALITY: '线条清晰、加粗、无断点。',
};

const promptConfig = {
  // ==================== 涂色绘本 (F01) ====================
  coloringBook: {
    prefix: '请生成一张A4竖版儿童涂色活动页。主题是关于：',
    suffix: [
      '。左上角有一个小缩略图，里面是已经完整涂好颜色的图案，颜色鲜艳饱满。',
      '正中间是同一幅图案的纯黑色线条稿。',
      CONSTRAINTS.LINE_ART,
      CONSTRAINTS.THUMBNAIL_LAYOUT,
      CONSTRAINTS.LINE_QUALITY,
      '白色背景。',
      CONSTRAINTS.NO_DECORATION,
    ].join(''),
    defaultPrompt: '一只可爱的小兔子在花园里',
    description: '涂色绘本 - 生成黑白线稿供儿童涂色',
    buildPrompt(userInput) {
      return `${this.prefix}${userInput}${this.suffix}`;
    },
  },

  // ==================== 素描涂色 (F02) ====================
  sketchColoring: {
    prefix: '请生成一张A4竖版素描涂色活动页。主题是关于：',
    suffix: [
      '。左上角有一个小缩略图，里面是已经完整涂好颜色的图案，色彩自然柔和。',
      '正中间是同一幅图案的铅笔素描线稿，笔触自然灵动，线条有粗细变化。',
      CONSTRAINTS.SKETCH_ART,
      CONSTRAINTS.THUMBNAIL_LAYOUT,
      '线条清晰、有素描笔触质感、无断点。',
      '白色背景。',
      CONSTRAINTS.NO_DECORATION,
    ].join(''),
    defaultPrompt: '一座美丽的城堡',
    description: '素描涂色 - 生成素描风格线稿供涂色',
    buildPrompt(userInput) {
      return `${this.prefix}${userInput}${this.suffix}`;
    },
  },

  // ==================== 对称画/镜像涂色 (F10) ====================
  symmetryDrawing: {
    prefix: '请生成一张A4竖版对称涂色活动页。主题是关于：',
    suffix: [
      '。左上角有一个小缩略图，里面是已经完整涂好颜色的对称图案，颜色鲜艳饱满。',
      '正中间是同一幅图案的纯黑色对称线稿，左右严格镜像对称。',
      CONSTRAINTS.LINE_ART,
      CONSTRAINTS.THUMBNAIL_LAYOUT,
      '线条清晰、加粗、无断点、对称精确。',
      '白色背景。',
      CONSTRAINTS.NO_DECORATION,
    ].join(''),
    defaultPrompt: '蝴蝶花纹对称图案',
    description: '对称画/镜像涂色 - 生成对称图案线稿',
    buildPrompt(userInput) {
      return `${this.prefix}${userInput}${this.suffix}`;
    },
  },

  // ==================== 汉字字帖 (F03) ====================
  hanziCopybook: {
    prefix: '请生成一张A4竖版汉字字帖练习页。练习的汉字是：',
    suffix: [
      '。排版要求：页面顶部是田字格中的示范字，用黑色粗体楷书书写，清晰标准；',
      '中间是描红格，示范字用浅灰色显示供描写；下方是3-4个空白田字格供独立书写。',
      '严格限制：每个田字格必须有完整的红色虚线十字格（横中线和竖中线），格子大小适中、排列整齐，汉字笔画规范、结构端正。',
      '白色背景，黑色文字，红色田字格辅助线。',
      '不要图片、插画、水印或任何装饰。适合A4纸打印。',
    ].join(''),
    defaultPrompt: '汉字"大"的字帖',
    description: '汉字字帖 - 生成田字格字帖',
    buildPrompt(userInput) {
      return `${this.prefix}${userInput}${this.suffix}`;
    },
  },

  // ==================== 古诗词配图 (F05) ====================
  poemIllustration: {
    prefix: '请生成一张A4竖版古诗词意境插画。诗词意境是：',
    suffix: [
      '。风格要求：中国传统水墨画风格，淡雅含蓄，笔意流畅，大量留白，墨色浓淡相宜。',
      '画面要准确传达诗词的意境和情感，景物与诗意呼应。',
      '严格限制：纯水墨画风格，不使用鲜艳色彩，以墨色为主可点缀淡彩，构图简洁有留白。',
      '白色背景。',
      '不要现代元素、卡通风格、文字标注、水印或任何装饰。适合A4纸打印。',
    ].join(''),
    defaultPrompt: '床前明月光的意境',
    description: '古诗词配图 - 生成与诗词意境匹配的插画',
    buildPrompt(userInput) {
      return `${this.prefix}${userInput}${this.suffix}`;
    },
  },

  // ==================== 英语单词闪卡 (F07) ====================
  englishFlashcard: {
    prefix: '请生成一张A4竖版儿童英语单词闪卡。单词是：',
    suffix: [
      '。布局要求：页面正中间是一幅与单词含义对应的卡通插画，占据画面大部分空间，插画下方用大号英文字母清晰标注单词拼写。',
      '风格要求：卡通风格，线条圆润可爱，色彩明亮饱满，形象生动易辨认，适合3-8岁儿童。',
      '白色背景。',
      '不要多余文字、拼音标注、水印或任何装饰。适合A4纸打印。',
    ].join(''),
    defaultPrompt: 'apple 苹果',
    description: '英语单词闪卡 - 生成单词配图闪卡',
    buildPrompt(userInput) {
      return `${this.prefix}${userInput}${this.suffix}`;
    },
  },

  // ==================== 数学练习 (F14) ====================
  mathWorksheet: {
    prefix: '请生成一张A4竖版儿童数学练习题页面。练习内容是：',
    suffix: [
      '。排版要求：题目整齐排列，每行3-4题，数字和运算符号用大号字体清晰显示，题目之间间距适中，留出足够的答题书写空间。',
      '页面顶部有标题栏。',
      '严格限制：纯数学题目排版，不出现插画、卡通装饰或多余图案，数字清晰规范、大小一致，等号对齐。',
      '白色背景，黑色文字。',
      '不要水印或任何装饰。适合A4纸打印。',
    ].join(''),
    defaultPrompt: '10以内加减法练习',
    description: '数学练习 - 生成数学练习题图片',
    buildPrompt(userInput) {
      return `${this.prefix}${userInput}${this.suffix}`;
    },
  },

  // ==================== 拼音练习 (F15) ====================
  pinyinWorksheet: {
    prefix: '请生成一张A4竖版汉语拼音练习页。练习内容是：',
    suffix: [
      '。排版要求：每个拼音字母在标准四线三格中书写，顶部是示范拼音用深色显示，中间是描红格用浅色供描写，下方是2-3个空白四线三格供独立书写。',
      '严格限制：四线三格辅助线必须清晰完整（上格线、中线、下格线、底线），拼音字母书写规范、占位准确，大小适中排列整齐。',
      '白色背景，黑色拼音字母，浅蓝色辅助线。',
      '不要插画、卡通装饰、水印或任何装饰。适合A4纸打印。',
    ].join(''),
    defaultPrompt: '声母b p m f的拼音练习',
    description: '拼音练习 - 生成拼音练习页',
    buildPrompt(userInput) {
      return `${this.prefix}${userInput}${this.suffix}`;
    },
  },

  // ==================== 迷宫游戏 (F18) ====================
  mazeGame: {
    prefix: '请生成一张A4竖版儿童迷宫游戏页面。迷宫主题是：',
    suffix: [
      '。迷宫要求：起点在左上角用绿色圆点标记，终点在右下角用红色星星标记，路径宽度适中适合儿童手指或铅笔通过，墙壁用粗黑色线条绘制，至少有一条从起点到终点的通路。',
      '严格限制：迷宫只能由黑色线条墙壁+白色通道构成，不允许出现彩色填充、阴影或3D效果，通道内部全部保持纯白色。',
      CONSTRAINTS.LINE_QUALITY,
      '白色背景。',
      '不要文字说明、水印或任何装饰。适合A4纸打印。',
    ].join(''),
    defaultPrompt: '从左上角到右下角的简单迷宫',
    description: '迷宫游戏 - 生成可打印的迷宫',
    buildPrompt(userInput) {
      return `${this.prefix}${userInput}${this.suffix}`;
    },
  },

  // ==================== 连线游戏 (F19) ====================
  connectDots: {
    prefix: '请生成一张A4竖版儿童连线游戏页面。连线图案是：',
    suffix: [
      '。游戏要求：页面上有15-25个编号圆点，按数字1、2、3…顺序依次连线后可形成目标图案的轮廓。',
      '每个圆点旁标注清晰的小号数字，点与点间距适中，连线顺序从左到右、从上到下，连线后图案居中显示。',
      '严格限制：画面只能由编号圆点+数字+白色背景构成，不允许出现已连好的线、填充色块或阴影，圆点用小黑点表示。',
      '白色背景。',
      '不要额外图案提示、水印或任何装饰。适合A4纸打印。',
    ].join(''),
    defaultPrompt: '连出一个星星的形状',
    description: '连线游戏 - 生成按数字连线图片',
    buildPrompt(userInput) {
      return `${this.prefix}${userInput}${this.suffix}`;
    },
  },

  // ==================== 找不同 (F20) ====================
  findDifference: {
    prefix: '请生成一张A4竖版儿童找不同游戏页面。场景是：',
    suffix: [
      '。游戏要求：页面上方和下方各有一张几乎完全相同的场景图，两图之间有5处细微差异。',
      '差异类型包括：某物体颜色不同、某物体缺失、某物体大小不同、某物体位置偏移等。',
      '差异要隐藏得自然巧妙，不能太明显也不能太难发现。',
      '严格限制：两张图大小一致、左右对齐，整体画风和色彩完全统一，只在指定的5处存在差异。',
      '不要用红圈标注差异位置，不要文字提示、水印或任何装饰。适合A4纸打印。',
    ].join(''),
    defaultPrompt: '公园场景中有5处不同',
    description: '找不同 - 生成找不同游戏图片',
    buildPrompt(userInput) {
      return `${this.prefix}${userInput}${this.suffix}`;
    },
  },

  // ==================== 涂色画板（自定义涂色）(F27) ====================
  customColoring: {
    prefix: '请生成一张A4竖版儿童涂色线稿。图案主题是：',
    suffix: [
      '。画面居中，图案尺寸适中占据大部分页面。',
      CONSTRAINTS.LINE_ART,
      CONSTRAINTS.LINE_QUALITY,
      '细节丰富适合涂色。白色背景。',
      CONSTRAINTS.NO_DECORATION,
    ].join(''),
    defaultPrompt: '一只恐龙',
    description: '涂色画板 - 生成自定义主题的涂色线稿',
    buildPrompt(userInput) {
      return `${this.prefix}${userInput}${this.suffix}`;
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

# 即梦AI 提示词配置说明

## 概述

`server/src/config/prompts.js` 管理所有即梦AI图片生成的提示词配置，采用 **prefix + userInput + suffix** 三段式拼接模式。

- **prefix**：固定前缀，控制画面风格和用途
- **suffix**：固定后缀，控制输出格式、约束和禁止项
- **defaultPrompt**：用户未提供输入时的默认值

## 功能模块

### 涂色绘本 (F01) — `coloringBook`

生成带缩略图参考的黑白涂色线稿。

| 字段 | 内容 |
|------|------|
| prefix | `请生成一张A4竖版儿童涂色活动页。主题是关于：` |
| 用户输入 | 主题描述，如"一只可爱的小兔子在花园里" |
| suffix | 缩略图+纯黑线稿双区域布局，严格限制黑线+白底，禁止填充/阴影/文字/水印 |
| defaultPrompt | `一只可爱的小兔子在花园里` |

**输出示例**：左上角彩色缩略图 + 中间纯黑线稿

---

### 素描涂色 (F02) — `sketchColoring`

生成带缩略图参考的铅笔素描线稿。

| 字段 | 内容 |
|------|------|
| prefix | `请生成一张A4竖版素描涂色活动页。主题是关于：` |
| 用户输入 | 主题描述 |
| suffix | 缩略图+素描线稿双区域布局，灰黑线条+白底，笔触有粗细变化 |
| defaultPrompt | `一座美丽的城堡` |

**与涂色绘本区别**：线稿为铅笔素描风格，允许灰度线条，而非纯黑线

---

### 对称画/镜像涂色 (F10) — `symmetryDrawing`

生成左右镜像对称的涂色线稿。

| 字段 | 内容 |
|------|------|
| prefix | `请生成一张A4竖版对称涂色活动页。主题是关于：` |
| 用户输入 | 对称图案描述 |
| suffix | 缩略图+对称黑线稿，左右严格镜像，黑线+白底 |
| defaultPrompt | `蝴蝶花纹对称图案` |

---

### 汉字字帖 (F03) — `hanziCopybook`

生成田字格汉字书写练习页。

| 字段 | 内容 |
|------|------|
| prefix | `请生成一张A4竖版汉字字帖练习页。练习的汉字是：` |
| 用户输入 | 汉字或词语 |
| suffix | 示范字（黑色楷书）→ 描红格（浅灰）→ 空白田字格，红色虚线十字格 |
| defaultPrompt | `汉字"大"的字帖` |

**配色**：黑字 + 红色田字格辅助线 + 白底

---

### 古诗词配图 (F05) — `poemIllustration`

生成传统水墨画风格的诗词意境插画。

| 字段 | 内容 |
|------|------|
| prefix | `请生成一张A4竖版古诗词意境插画。诗词意境是：` |
| 用户输入 | 诗词或意境描述 |
| suffix | 传统水墨画风格，墨色为主可点缀淡彩，大量留白，禁止鲜艳色彩和现代元素 |
| defaultPrompt | `床前明月光的意境` |

---

### 英语单词闪卡 (F07) — `englishFlashcard`

生成单词配图闪卡。

| 字段 | 内容 |
|------|------|
| prefix | `请生成一张A4竖版儿童英语单词闪卡。单词是：` |
| 用户输入 | 单词及中文释义，如"apple 苹果" |
| suffix | 居中卡通插画 + 下方大号英文单词，色彩明亮，适合3-8岁 |
| defaultPrompt | `apple 苹果` |

---

### 数学练习 (F14) — `mathWorksheet`

生成数学练习题排版页面。

| 字段 | 内容 |
|------|------|
| prefix | `请生成一张A4竖版儿童数学练习题页面。练习内容是：` |
| 用户输入 | 练习内容描述 |
| suffix | 整齐排列、大号字体、等号对齐，纯排版无装饰 |
| defaultPrompt | `10以内加减法练习` |

**配色**：黑字 + 白底

---

### 拼音练习 (F15) — `pinyinWorksheet`

生成四线三格拼音书写练习页。

| 字段 | 内容 |
|------|------|
| prefix | `请生成一张A4竖版汉语拼音练习页。练习内容是：` |
| 用户输入 | 拼音内容描述 |
| suffix | 示范拼音 → 描红格 → 空白四线三格，浅蓝色辅助线 |
| defaultPrompt | `声母b p m f的拼音练习` |

**配色**：黑字 + 浅蓝辅助线 + 白底

---

### 迷宫游戏 (F18) — `mazeGame`

生成可打印的迷宫游戏。

| 字段 | 内容 |
|------|------|
| prefix | `请生成一张A4竖版儿童迷宫游戏页面。迷宫主题是：` |
| 用户输入 | 迷宫主题或难度描述 |
| suffix | 绿色起点 + 红色终点，粗黑线条墙壁 + 白色通道，至少一条通路 |
| defaultPrompt | `从左上角到右下角的简单迷宫` |

---

### 连线游戏 (F19) — `connectDots`

生成按数字顺序连线的游戏页面。

| 字段 | 内容 |
|------|------|
| prefix | `请生成一张A4竖版儿童连线游戏页面。连线图案是：` |
| 用户输入 | 连线后形成的图案描述 |
| suffix | 15-25个编号圆点，黑点+数字+白底，禁止提前连线 |
| defaultPrompt | `连出一个星星的形状` |

---

### 找不同 (F20) — `findDifference`

生成两图找5处差异的游戏页面。

| 字段 | 内容 |
|------|------|
| prefix | `请生成一张A4竖版儿童找不同游戏页面。场景是：` |
| 用户输入 | 场景描述 |
| suffix | 上下两张几乎相同的图，5处细微差异（颜色/缺失/大小/位置），禁止红圈标注 |
| defaultPrompt | `公园场景中有5处不同` |

---

### 涂色画板 (F27) — `customColoring`

生成自定义主题的纯涂色线稿（无缩略图参考）。

| 字段 | 内容 |
|------|------|
| prefix | `请生成一张A4竖版儿童涂色线稿。图案主题是：` |
| 用户输入 | 任意图案主题 |
| suffix | 纯黑线稿+白底，细节丰富适合涂色，禁止填充/阴影/文字/水印 |
| defaultPrompt | `一只恐龙` |

**与涂色绘本区别**：无左上角缩略图，纯线稿

---

### 通用图片生成 — `general`

不添加额外提示词修饰，直接使用用户输入。

| 字段 | 内容 |
|------|------|
| prefix | （空） |
| 用户输入 | 完整提示词 |
| suffix | `，高清画质，适合A4纸打印` |
| defaultPrompt | （空） |

---

## 公共约束片段

代码中提取了可复用的约束片段（`CONSTRAINTS` 对象），避免重复：

| 片段名 | 说明 | 使用模块 |
|--------|------|---------|
| `LINE_ART` | 黑线+白底，无填充/阴影/灰度 | coloringBook, symmetryDrawing, customColoring |
| `SKETCH_ART` | 灰黑线条+白底，无色块填充 | sketchColoring |
| `THUMBNAIL_LAYOUT` | 缩略图可有色+中间纯线稿 | coloringBook, sketchColoring, symmetryDrawing |
| `LINE_QUALITY` | 线条清晰、加粗、无断点 | coloringBook, symmetryDrawing, mazeGame, customColoring |
| `NO_DECORATION` | 不要文字/字母/数字/水印/装饰 | coloringBook, symmetryDrawing, customColoring |

## API 调用示例

```bash
# 涂色绘本
curl -X POST http://localhost:3000/api/v1/image/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"coloringBook","prompt":"一只可爱的小猫咪"}'

# 返回
{
  "code": 0,
  "data": {
    "recordId": 1,
    "previewUrls": ["http://xxx/key?e=xxx&token=xxx"]
  }
}
```

## 新增提示词类型

在 `promptConfig` 中添加新条目即可：

```js
newType: {
  prefix: '请生成一张...',
  suffix: '。严格限制：...',
  defaultPrompt: '默认输入',
  description: '类型说明',
  buildPrompt(userInput) {
    return `${this.prefix}${userInput}${this.suffix}`;
  },
},
```

export default [
  // 产品
  {
    url: '/api/v1/admin/product',
    method: 'get',
    response: () => {
      return {
        data: [
          { id: 1, name: '涂色绘本', type: 'coloringBook', default_prompt: '一只可爱的小兔子在花园里', description: '涂色绘本 - 生成黑白线稿供儿童涂色', sort_order: 1, is_active: 1 },
          { id: 2, name: '素描涂色', type: 'sketchColoring', default_prompt: '一座美丽的城堡', description: '素描涂色 - 生成素描风格线稿供涂色', sort_order: 2, is_active: 1 },
          { id: 3, name: '对称画', type: 'symmetryDrawing', default_prompt: '蝴蝶花纹对称图案', description: '对称画/镜像涂色 - 生成对称图案线稿', sort_order: 3, is_active: 1 },
          { id: 4, name: '汉字字帖', type: 'hanziCopybook', default_prompt: '汉字"大"的字帖', description: '汉字字帖 - 生成田字格字帖', sort_order: 4, is_active: 1 },
          { id: 5, name: '古诗词配图', type: 'poemIllustration', default_prompt: '床前明月光的意境', description: '古诗词配图 - 生成与诗词意境匹配的插画', sort_order: 5, is_active: 1 },
          { id: 6, name: '英语闪卡', type: 'englishFlashcard', default_prompt: 'apple 苹果', description: '英语单词闪卡 - 生成单词配图闪卡', sort_order: 6, is_active: 1 },
          { id: 7, name: '数学练习', type: 'mathWorksheet', default_prompt: '10以内加减法练习', description: '数学练习 - 生成数学练习题图片', sort_order: 7, is_active: 1 },
          { id: 8, name: '拼音练习', type: 'pinyinWorksheet', default_prompt: '声母b p m f的拼音练习', description: '拼音练习 - 生成拼音练习页', sort_order: 8, is_active: 1 },
          { id: 9, name: '迷宫游戏', type: 'mazeGame', default_prompt: '从左上角到右下角的简单迷宫', description: '迷宫游戏 - 生成可打印的迷宫', sort_order: 9, is_active: 1 },
          { id: 10, name: '连线游戏', type: 'connectDots', default_prompt: '连出一个星星的形状', description: '连线游戏 - 生成按数字连线图片', sort_order: 10, is_active: 1 },
          { id: 11, name: '找不同', type: 'findDifference', default_prompt: '公园场景中有5处不同', description: '找不同 - 生成找不同游戏图片', sort_order: 11, is_active: 1 },
          { id: 12, name: '涂色画板', type: 'customColoring', default_prompt: '一只恐龙', description: '涂色画板 - 生成自定义主题的涂色线稿', sort_order: 12, is_active: 1 },
        ]
      }
    }
  },
  {
    url: '/api/v1/admin/product/:id',
    method: 'get',
    response: ({ params }) => {
      const products = {
        1: { id: 1, name: '涂色绘本', type: 'coloringBook', default_prompt: '一只可爱的小兔子在花园里', description: '涂色绘本 - 生成黑白线稿供儿童涂色', sort_order: 1, is_active: 1 },
        2: { id: 2, name: '素描涂色', type: 'sketchColoring', default_prompt: '一座美丽的城堡', description: '素描涂色 - 生成素描风格线稿供涂色', sort_order: 2, is_active: 1 },
      }
      return { data: products[params.id] || {} }
    }
  },
  {
    url: '/api/v1/admin/product',
    method: 'post',
    statusCode: 201,
    response: ({ body }) => {
      return { data: { id: Date.now() } }
    }
  },
  {
    url: '/api/v1/admin/product/:id',
    method: 'put',
    statusCode: 204
  },
  {
    url: '/api/v1/admin/product/:id',
    method: 'delete',
    statusCode: 204
  },
  {
    url: '/api/v1/admin/product/:id/toggle',
    method: 'patch',
    statusCode: 204
  },
]
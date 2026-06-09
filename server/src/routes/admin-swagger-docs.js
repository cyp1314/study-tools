/**
 * 管理后台接口 Swagger 文档补充
 * 
 * 使用说明：
 * 1. 将此文件中的注释添加到对应的路由文件中
 * 2. 或者直接在 Swagger UI 中查看文档
 */

// ==================== 图片记录 ====================
/**
 * @swagger
 * /admin/image-record:
 *   get:
 *     summary: 获取图片记录列表
 *     tags: [管理后台-图片记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: userId
 *         in: query
 *         schema:
 *           type: integer
 *         description: 用户ID筛选
 *     responses:
 *       200:
 *         description: 获取成功
 *
 * /admin/image-record/{id}:
 *   get:
 *     summary: 获取图片记录详情
 *     tags: [管理后台-图片记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *   delete:
 *     summary: 删除图片记录
 *     tags: [管理后台-图片记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 */

// ==================== 积分记录 ====================
/**
 * @swagger
 * /admin/point-log:
 *   get:
 *     summary: 获取积分记录列表
 *     tags: [管理后台-积分记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: userId
 *         in: query
 *         schema:
 *           type: integer
 *         description: 用户ID筛选
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *         description: 变动类型筛选
 *     responses:
 *       200:
 *         description: 获取成功
 */

// ==================== 签到配置 ====================
/**
 * @swagger
 * /admin/signin-config:
 *   get:
 *     summary: 获取签到配置列表
 *     tags: [管理后台-签到配置]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *   post:
 *     summary: 创建签到配置
 *     tags: [管理后台-签到配置]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [day, points]
 *             properties:
 *               day:
 *                 type: integer
 *                 description: 连续签到天数
 *               points:
 *                 type: integer
 *                 description: 奖励积分
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: 创建成功
 *
 * /admin/signin-config/{id}:
 *   put:
 *     summary: 更新签到配置
 *     tags: [管理后台-签到配置]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               day:
 *                 type: integer
 *               points:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *   delete:
 *     summary: 删除签到配置
 *     tags: [管理后台-签到配置]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 */

// ==================== 签到记录 ====================
/**
 * @swagger
 * /admin/signin-record:
 *   get:
 *     summary: 获取签到记录列表
 *     tags: [管理后台-签到记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: userId
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *
 * /admin/signin-record/{id}:
 *   delete:
 *     summary: 删除签到记录
 *     tags: [管理后台-签到记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 */

// ==================== 充值订单 ====================
/**
 * @swagger
 * /admin/recharge-order:
 *   get:
 *     summary: 获取充值订单列表
 *     tags: [管理后台-充值订单]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: userId
 *         in: query
 *         schema:
 *           type: integer
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *         description: 订单状态筛选
 *     responses:
 *       200:
 *         description: 获取成功
 *
 * /admin/recharge-order/{id}:
 *   get:
 *     summary: 获取充值订单详情
 *     tags: [管理后台-充值订单]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *
 * /admin/recharge-order/{id}/pay:
 *   patch:
 *     summary: 标记订单为已支付
 *     tags: [管理后台-充值订单]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 标记成功
 *
 * /admin/recharge-order/{id}/refund:
 *   patch:
 *     summary: 退款
 *     tags: [管理后台-充值订单]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 退款成功
 */

// ==================== 轮播图 ====================
/**
 * @swagger
 * /admin/banner:
 *   get:
 *     summary: 获取轮播图列表
 *     tags: [管理后台-轮播图]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *   post:
 *     summary: 创建轮播图
 *     tags: [管理后台-轮播图]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, imageKey]
 *             properties:
 *               title:
 *                 type: string
 *               imageKey:
 *                 type: string
 *               linkType:
 *                 type: string
 *               linkUrl:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 创建成功
 *
 * /admin/banner/{id}:
 *   get:
 *     summary: 获取轮播图详情
 *     tags: [管理后台-轮播图]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *   put:
 *     summary: 更新轮播图
 *     tags: [管理后台-轮播图]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               imageKey:
 *                 type: string
 *               linkType:
 *                 type: string
 *               linkUrl:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 更新成功
 *   delete:
 *     summary: 删除轮播图
 *     tags: [管理后台-轮播图]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 *
 * /admin/banner/{id}/toggle:
 *   patch:
 *     summary: 切换轮播图状态
 *     tags: [管理后台-轮播图]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 切换成功
 */

// ==================== 分类 ====================
/**
 * @swagger
 * /admin/category:
 *   get:
 *     summary: 获取分类列表
 *     tags: [管理后台-分类]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *   post:
 *     summary: 创建分类
 *     tags: [管理后台-分类]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 创建成功
 *
 * /admin/category/{id}:
 *   get:
 *     summary: 获取分类详情
 *     tags: [管理后台-分类]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *   put:
 *     summary: 更新分类
 *     tags: [管理后台-分类]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 更新成功
 *   delete:
 *     summary: 删除分类
 *     tags: [管理后台-分类]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 *
 * /admin/category/{id}/toggle:
 *   patch:
 *     summary: 切换分类状态
 *     tags: [管理后台-分类]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 切换成功
 */

// ==================== 产品 ====================
/**
 * @swagger
 * /admin/product:
 *   get:
 *     summary: 获取产品列表
 *     tags: [管理后台-产品]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 获取成功
 *   post:
 *     summary: 创建产品
 *     tags: [管理后台-产品]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               prefix:
 *                 type: string
 *               suffix:
 *                 type: string
 *               defaultPrompt:
 *                 type: string
 *               description:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: 创建成功
 *
 * /admin/product/{id}:
 *   get:
 *     summary: 获取产品详情
 *     tags: [管理后台-产品]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *   put:
 *     summary: 更新产品
 *     tags: [管理后台-产品]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               prefix:
 *                 type: string
 *               suffix:
 *                 type: string
 *               defaultPrompt:
 *                 type: string
 *               description:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: 更新成功
 *   delete:
 *     summary: 删除产品
 *     tags: [管理后台-产品]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
 *
 * /admin/product/{id}/toggle:
 *   patch:
 *     summary: 切换产品状态
 *     tags: [管理后台-产品]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 切换成功
 */

// ==================== API 日志 ====================
/**
 * @swagger
 * /admin/api-log:
 *   get:
 *     summary: 获取 API 日志列表
 *     tags: [管理后台-API日志]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: userId
 *         in: query
 *         schema:
 *           type: integer
 *       - name: method
 *         in: query
 *         schema:
 *           type: string
 *       - name: url
 *         in: query
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *
 * /admin/api-log/stats:
 *   get:
 *     summary: 获取 API 日志统计
 *     tags: [管理后台-API日志]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: days
 *         in: query
 *         schema:
 *           type: integer
 *           default: 7
 *         description: 统计天数
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRequests:
 *                       type: integer
 *                     avgResponseTime:
 *                       type: number
 *                     errorRate:
 *                       type: number
 *                     topUrls:
 *                       type: array
 *
 * /admin/api-log/{id}:
 *   get:
 *     summary: 获取 API 日志详情
 *     tags: [管理后台-API日志]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *
 * /admin/api-log/cleanup:
 *   delete:
 *     summary: 清理 API 日志
 *     description: 清理 30 天前的日志数据
 *     tags: [管理后台-API日志]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 清理成功
 */

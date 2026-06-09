const Router = require('@koa/router');
const businessController = require('../controllers/business');

const router = new Router();

/**
 * @swagger
 * tags:
 *   - name: 业务公开
 *     description: 业务公开接口(无需登录)
 *
 * /business/banners:
 *   get:
 *     summary: 获取轮播图列表
 *     description: 获取所有启用的轮播图
 *     tags: [业务公开]
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
 *                   example: 0
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                       linkType:
 *                         type: string
 *                       linkUrl:
 *                         type: string
 *
 * /business/categories:
 *   get:
 *     summary: 获取分类列表
 *     description: 获取所有启用的分类
 *     tags: [业务公开]
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       icon:
 *                         type: string
 *                       sortOrder:
 *                         type: integer
 *
 * /business/products:
 *   get:
 *     summary: 获取产品列表
 *     description: 获取所有启用的产品
 *     tags: [业务公开]
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
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       description:
 *                         type: string
 *                       coverImage:
 *                         type: string
 *
 * /business/products/{id}:
 *   get:
 *     summary: 获取产品详情
 *     description: 获取单个产品的详细信息
 *     tags: [业务公开]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: 产品 ID
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 产品不存在
 */
router.get('/banners', businessController.getBanners);
router.get('/categories', businessController.getCategories);
router.get('/products', businessController.getProducts);
router.get('/products/:id', businessController.getProductById);

module.exports = router.routes();

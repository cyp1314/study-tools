const Router = require('@koa/router');
const businessController = require('../controllers/business');

const router = new Router();

/**
 * C端公开接口 - 轮播图/分类/产品（无需登录）
 */
router.get('/banners', businessController.getBanners);
router.get('/categories', businessController.getCategories);
router.get('/products', businessController.getProducts);
router.get('/products/:id', businessController.getProductById);

module.exports = router.routes();

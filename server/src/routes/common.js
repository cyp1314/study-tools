const Router = require('@koa/router');
const commonController = require('../controllers/common');

const router = new Router();

// 通用接口
router.post('/upload', commonController.uploadImage);

module.exports = router.routes();
const Router = require('@koa/router');
const rechargePackageController = require('../controllers/rechargePackage');
const adminUserController = require('../controllers/adminUser');
const adminImageRecordController = require('../controllers/adminImageRecord');
const adminPointLogController = require('../controllers/adminPointLog');
const adminSignInConfigController = require('../controllers/adminSignInConfig');
const adminSignInRecordController = require('../controllers/adminSignInRecord');
const adminRechargeOrderController = require('../controllers/adminRechargeOrder');
const adminBannerController = require('../controllers/adminBanner');
const adminCategoryController = require('../controllers/adminCategory');
const adminProductController = require('../controllers/adminProduct');

const router = new Router();

// ==================== 充值套餐 ====================
router.get('/recharge-package', rechargePackageController.list);
router.get('/recharge-package/:id', rechargePackageController.getById);
router.post('/recharge-package', rechargePackageController.create);
router.put('/recharge-package/:id', rechargePackageController.update);
router.delete('/recharge-package/:id', rechargePackageController.remove);
router.patch('/recharge-package/:id/toggle', rechargePackageController.toggleActive);

// ==================== 用户管理 ====================
router.get('/user', adminUserController.list);
router.get('/user/:id', adminUserController.getById);
router.put('/user/:id', adminUserController.update);
router.post('/user/:id/adjust-points', adminUserController.adjustPoints);
router.delete('/user/:id', adminUserController.remove);

// ==================== 图片记录 ====================
router.get('/image-record', adminImageRecordController.list);
router.get('/image-record/:id', adminImageRecordController.getById);
router.delete('/image-record/:id', adminImageRecordController.remove);

// ==================== 积分记录 ====================
router.get('/point-log', adminPointLogController.list);

// ==================== 签到配置 ====================
router.get('/signin-config', adminSignInConfigController.list);
router.post('/signin-config', adminSignInConfigController.create);
router.put('/signin-config/:id', adminSignInConfigController.update);
router.delete('/signin-config/:id', adminSignInConfigController.remove);

// ==================== 签到记录 ====================
router.get('/signin-record', adminSignInRecordController.list);
router.delete('/signin-record/:id', adminSignInRecordController.remove);

// ==================== 充值订单 ====================
router.get('/recharge-order', adminRechargeOrderController.list);
router.get('/recharge-order/:id', adminRechargeOrderController.getById);
router.patch('/recharge-order/:id/pay', adminRechargeOrderController.markPaid);
router.patch('/recharge-order/:id/refund', adminRechargeOrderController.refund);

// ==================== 轮播图 ====================
router.get('/banner', adminBannerController.list);
router.get('/banner/:id', adminBannerController.getById);
router.post('/banner', adminBannerController.create);
router.put('/banner/:id', adminBannerController.update);
router.delete('/banner/:id', adminBannerController.remove);
router.patch('/banner/:id/toggle', adminBannerController.toggleActive);

// ==================== 分类 ====================
router.get('/category', adminCategoryController.list);
router.get('/category/:id', adminCategoryController.getById);
router.post('/category', adminCategoryController.create);
router.put('/category/:id', adminCategoryController.update);
router.delete('/category/:id', adminCategoryController.remove);
router.patch('/category/:id/toggle', adminCategoryController.toggleActive);

// ==================== 产品 ====================
router.get('/product', adminProductController.list);
router.get('/product/:id', adminProductController.getById);
router.post('/product', adminProductController.create);
router.put('/product/:id', adminProductController.update);
router.delete('/product/:id', adminProductController.remove);
router.patch('/product/:id/toggle', adminProductController.toggleActive);

module.exports = router.routes();

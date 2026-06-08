const Router = require('@koa/router');
const menuController = require('../controllers/menu');

const router = new Router();

// 菜单管理 - 直接使用路径，不带 /menu 前缀
router.get('/my-menu', menuController.getMyMenu);
router.get('/menu', menuController.getMenuList);
router.post('/menu', menuController.create);
router.put('/menu/:id', menuController.update);
router.patch('/menu/:id', menuController.update);
router.delete('/menu/:id', menuController.delete);

module.exports = router.routes();
const Router = require('@koa/router');
const { index, testDb } = require('../controllers/index');

const router = new Router();

router.get('/', index);
router.get('/test-db', testDb);

module.exports = router;

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const router = require('./routes/index');

const app = new Koa();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser());

// 路由
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

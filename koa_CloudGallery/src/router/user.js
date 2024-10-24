const Router = require('koa-router');
const { wxlogin, } = require('../controller/user');
const router = new Router({ prefix: '/user' });

// 微信登录凭证code登录
router.post('/login/wxcode', wxlogin);

module.exports = router;
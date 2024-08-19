const Router = require('koa-router');
const { register, jwtLogin, updatePassword, } = require('../controller/user');
const authJWT = require('../middleware/auth_jwt')
const verifyUserInfo = require('../middleware/verify_userinfo')
const router = new Router({ prefix: '/user' });

// 注册
router.post('/register', verifyUserInfo, register);

// JWT登录
router.post('/login/jwt', jwtLogin);

// 修改密码
router.post('/updatepassword', authJWT, updatePassword);

module.exports = router;
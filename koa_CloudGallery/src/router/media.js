const Router = require('koa-router');
const { createMedia, deleteMedia } = require('../controller/media.js');
const router = new Router({ prefix: '/media' });

// 创建媒体
router.post('/create', createMedia);

// 删除媒体
router.post('/delete', deleteMedia); 

module.exports = router;
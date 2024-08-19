const Router = require('koa-router');
const { createAlbum, deleteAlbum, modifyAlbum, findAlbum, findAllAlbum } = require('../controller/album.js');
const router = new Router({ prefix: '/album' });

// 创建相册
router.post('/create', createAlbum);

// 删除相册
router.post('/delete', deleteAlbum);

// 修改相册信息
router.post('/modify', modifyAlbum);

// 查找相册信息
router.get('/findbyid', findAlbum);

// 查找所有相册信息
router.get('/all', findAllAlbum);

module.exports = router;
// 这个文件管理该目录下的所有路由
const fs = require('fs');
const Router = require('koa-router');
const router = new Router();

fs.readdirSync(__dirname).forEach(file => {
    if(file !== 'index.js'){
        let r = require('./' + file);
        router.use(r.routes());
    }
})

module.exports = router;
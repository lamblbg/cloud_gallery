const koa = require('koa');
const bodyParser = require('koa-bodyparser')
const router = require('./router/index');
const cors = require('koa2-cors')

const app = new koa();
app.use(bodyParser())
app.use(cors())
app.use(router.routes())
app.use(require('koa-static')('./src/public'));

app.listen(3001, () => {
    console.log('server is running at http://localhost:3001');
});
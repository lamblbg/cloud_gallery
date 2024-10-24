const nodeEnv = process.env.NODE_ENV || 'development'
const appid = process.env.APP_KET || 'wx98c75a43b16875ee' // 微信小程序appid
const appSecret = process.env.APP_SECRET || 'b3383784d52bf58d3b39a5b7f602cb96' // 微信小程序appSecret

// mogoDB连接配置
let mongoDBConnectConfig = null
if (nodeEnv === 'development') {
  mongoDBConnectConfig = {
    name: 'mongodb://127.0.0.1:27017/login-program',
  }
}
else if (nodeEnv === 'production') {
  mongoDBConnectConfig = {
    name: 'mongodb://127.0.0.1:27017/login-program',
  }
}

// redis连接配置
let redisConnectConfig = null
if (nodeEnv === 'development') {
  redisConnectConfig = {
    host: 'localhost',
    port: 6379,
  }
}
else if (nodeEnv === 'production') {
  redisConnectConfig = {
    host: 'localhost',
    port: 6379,
  }
}


module.exports = {
  mongoDBConnectConfig,
  redisConnectConfig,
  appid,
  appSecret,
}
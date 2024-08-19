const nodeEnv = process.env.NODE_ENV || 'development'

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
}

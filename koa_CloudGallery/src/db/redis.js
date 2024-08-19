const { createClient } = require('redis')
const REDIS_SERRVER = '127.0.0.1:6379'


class Redis {
    client
    async init() {
        try {
            this.client = await createClient({
                url: `redis://${REDIS_SERRVER}`
            })
                .on('error', err => {
                    console.log('node-redis与redis服务器连接失败：' + err.message.toLowerCase())
                    process.exit()
                })
                .on('ready', () => {
                    console.log('node-redis与redis服务器连接成功')
                })
                .connect();

            if (!this.client.isReady) return process.exit();
            return this.client;
        } catch (error) {
            console.log('node-redis与redis服务器连接失败：' + error.message.toLowerCase())
            return process.exit();
        }
    }

}

module.exports = new Redis()
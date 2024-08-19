// 更多redisJSON的使用参考：https://blog.csdn.net/qq_26664043/article/details/138028229
const redis = require('../db/redis')

class RedisHandler {
    // 构造函数，初始化redis客户端
    constructor() {
        if (!redis.client) {
            redis.init().then((client) => {
                this.client = client
            })
        }
        else {
            this.client = redis.client
        }
    }

    // 设置键值对，并设置过期时间
    async set(key, value, expire = 0) {
        try {
            if (expire > 0) {
                // 设置键值对，并设置过期时间
                return await this.client.set(key, value, {
                    EX: expire,
                });
            } else {
                // 设置键值对，不设置过期时间
                return await this.client.set(key, value);
            }
        } catch (error) {
            return error.message;
        }
    }

    // 获取键对应的值
    async get(key) {
        try {
            return await this.client.get(key);
        } catch (error) {
            return error.message;
        }
    }

    // 删除键值对
    async del(key) {
        try {
            return await this.client.del(key);
        } catch (error) {
            return error.message;
        }
    }

    // 获取哈希表中某个键的值
    async hGet(key, field) {
        try {
            return await this.client.hGet(key, field);
        } catch (error) {
            return error.message;
        }
    }

    // 向哈希表添加一个键值对
    async hSet(key, field, value) {
        try {
            return await this.client.hSet(key, field, value);
        } catch (error) {
            return error.message;
        }
    }

    // 获取哈希表中的所有键值对
    async hGetAll(key) {
        try {
            return await this.client.hGetAll(key);
        } catch (error) {
            return error.message;
        }
    }

    // 获取哈希表中的所有值
    async hVals(key) {
        try {
            return await this.client.hVals(key);
        } catch (error) {
            return error.message;
        }
    }

    // --以下功能使用到了redisJSON模块，需要redis服务器版本大于6.0，且已经装上redisJSON模块
    //  存储一个对象
    async setObject(key, val, expires) {
        try {
            const res = await this.client.sendCommand(['json.set', key, '$', JSON.stringify(val)])
            if (expires) await this.client.expire(key, expires)
            return res
        } catch (error) {
            return error.message;
        }
    }

    //  更新一个对象(包含添加新字段)
    async updateObject(key, path, val) {
        try {
            return await this.client.sendCommand(['json.set', key, `$.${path}`, JSON.stringify(val)])

        } catch (error) {
            return error.message;
        }
    }

    //  获取一个对象或其中某个键对应的值
    async getObject(key, path) {
        try {
            const result = await this.client.sendCommand(['json.get', key, path ? `$.${path}` : '$'])
            return JSON.parse(result)[0]
        } catch (error) {
            return error.message;
        }
    }
}

// 导出RedisHandler实例
module.exports = new RedisHandler();
const mongoose = require('mongoose');
const MONGODB_SERVER = '127.0.0.1:27017';
const DATABASE_NAME = 'cloud_gallery';


// 生成一个mongoosedb的连接类
class MongoDb {
    conn
    async init() {
        try {
            this.conn = await mongoose.connect(`mongodb://${MONGODB_SERVER}/`, {
                dbName: DATABASE_NAME,
                serverSelectionTimeoutMS: 1000 * 10 // 10s后超时,不限于初始连接
            })

            switch (this.conn.connection.readyState) {
                case 1:
                    console.log('mongoose与mongodb服务器连接成功')
                    break;
                case 3:
                    console.log('mongoose与mongodb服务器断开连接')
                    break;
            }

            if (!this.conn) return process.exit();
            else return this.conn;
        } catch (error) {
            console.log('mongoose与mongodb服务器连接失败：' + error.message.toLowerCase())
            return process.exit();
        }
    }

}

module.exports = new MongoDb()
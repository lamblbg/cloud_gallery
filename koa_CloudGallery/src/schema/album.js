const { Schema } = require('mongoose');


module.exports = new Schema({
    // 关联的用户ID 
    userId: {
        type: String,
    },
    // 相册名称 
    name: {
        type: String,
    },
    // 相册描述 
    description: {
        type: String
    },
    // 相册封面 
    cover: {
        type: String
    },
    // 相册中的媒体数量
    mediaCount: {
        type: Number,
        default: 0
    },
    // 创建时间，类型为日期，默认值为当前时间
    createTime: {
        type: Date,
        default: Date.now
    },
    // 是否已删除
    isDeleted: {
        type: Boolean,
        default: false
    }
}) 
const { Schema } = require('mongoose');


module.exports = new Schema({
    // 关联的相册ID
    albumId: {
        type: String,
    },
    // 媒体文件名
    name: {
        type: String,
    },
    // 媒体类型
    type: {
        type: String
    },
    // 媒体链接
    url: {
        type: String
    },
    // 媒体大小
    size: {
        type: Number
    },
    // 媒体时长（视频类型特有）
    duration: {
        type: Number
    },
    // 创建时间
    createTime: {
        type: Date,
        default: Date.now
    },
    // 是否删除
    isDeleted: {
        type: Boolean,
        default: false
    }
}) 
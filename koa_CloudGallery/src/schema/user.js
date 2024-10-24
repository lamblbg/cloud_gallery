const { Schema } = require('mongoose');


module.exports = new Schema({
    // openid
    openid: {
        type: String,
    },
    // 用户账号
    account: {
        type: String,
    },
    // 用户密码
    password: {
        type: String,
    },
    nickName: {
        type: String,
    },
    // 用户头像
    avatar: {
        type: String
    },
    // 用户上次登录时间
    lastLogin: {
        type: Date
    },
    // 用户创建时间
    createTime: {
        type: Date,
        default: Date.now
    },
}) 
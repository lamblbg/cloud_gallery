const UserModel = require('../model/user')
const { getJscode2session } = require('../utils/wx')
const RedisHandler = require('../utils/redisHandler')
const { encrypt, decrypt } = require('../utils/crypto')

class userService {

	async wxlogin(code) {
		// 换取用户信息
		const jscode2session = await getJscode2session(code)
		if (jscode2session.errmsg)
			throw new Error('无法通过该code到微信服务器换取用户信息，' + jscode2session.errmsg)
		
		const { openid } = jscode2session
		let userInfo = await UserModel.findByOpenid(openid)
		if (!userInfo) {
			userInfo = await UserModel.create({ openid, nickName: `微信用户`, lastLogin: Date.now() })
		}
		const _id = userInfo._id
		// 创建session
		const session = encrypt(_id)
		// 把该用户信息、jscode2session和登录凭证存储到redis中，并设置过期时间
		let result = { userInfo, session, jscode2session }
		RedisHandler.setObject(_id.toString(), result, 1 * 60 * 60 * 12) // 半天

		// 移除jscode2session，因为这个不能下发到客户端
		delete result.jscode2session
		return result

	}
}
module.exports = new userService();

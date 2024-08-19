const UserModel = require('../model/user')
const jwt = require('../utils/JWT')

class userService {
	async register(phone, password) {
		let userInfo = await UserModel.findByAccount(phone)
		if (!userInfo) {
			return UserModel.create({ account: phone, password })
		}
		else
			return 1

	}

	async jwtLogin(phone, password) {
		let userInfo = await UserModel.findByAccountAndPwd(phone, password)
		if (!userInfo) {
			userInfo = await this.register(phone, password)
		}
		userInfo = userInfo.toObject()
		const _id = userInfo._id

		// 更新登录时间
		userInfo.lastLogin = new Date(Date.now())
		await UserModel.update({ _id }, userInfo)
		// 移除敏感信息
		delete userInfo.password
		// 创建token并设置过期时间
		const token = jwt.generate(userInfo, 1 * 60 * 60 * 24 * 7) // 7天

		return { userInfo, token }
	}


}
module.exports = new userService();

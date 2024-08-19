const userSchema = require('../schema/user')
const mongodb = require('../db/mongodb')

class UserModel {
	constructor() {
		if (!mongodb.conn) {
			mongodb.init().then((conn) => {
				this.User = conn.model('user', userSchema)
			})
		}
		else{
			this.User = mongodb.conn.model('user', userSchema)
		}
	}

	async findByOpenid(openid) {
		const users = await this.User.find({ openid })
		if (users.length == 0) return null
		return users[0]
	}

	async findById(id) {
		const users = await this.User.find({ _id: id })
		if (users.length == 0) return null
		return users[0]
	}

	async findByAccount(account) {
		const users = await this.User.find({ account })
		if (users.length == 0) return null
		return users[0]
	}

	async findByAccountAndPwd(account, password) {
		const users = await this.User.find({ account, password })
		if (users.length == 0) return null
		return users[0]
	}

	async create(config) {
		return await this.User.create(config)
	}

	async update(filter, newData) {
		return await this.User.updateOne(filter, newData)
	}
}

module.exports = new UserModel();

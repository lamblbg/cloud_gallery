const userService = require('../service/user')

class UserController {

    async wxlogin(ctx, next) {
        const { code } = ctx.request.body
        let result = null

        try {
            if (code) {
                let loginInfo = await userService.wxlogin(code)
                result = { code: 0, message: '登录成功', data: loginInfo }
            }
        } catch (error) {
            ctx.status = 500
            result = { code: -1, message: '服务器内部错误：' + error.message }
        }

        ctx.body = result
    }
}

module.exports = new UserController();
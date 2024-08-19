const userService = require('../service/user')

class UserController {
    async register(ctx, next) {
        const { phone, password } = ctx.request.body
        let result = null
        try {
            if (phone && password) {
                const res = await userService.register(phone, password)
                if (res)
                    result = { code: 0, message: '注册成功' }
                else if (res === 1)
                    result = { code: 1, message: '该手机号已注册，请直接登录' }
            }
            else {
                ctx.status = 400
                result = { code: 2, message: '缺少必要的注册信息' }
            }
        } catch (error) {
            ctx.status = 500
            result = { code: -1, message: '服务器内部错误：' + error.message }
        }
        ctx.body = result
    }

    async jwtLogin(ctx, next) {
        const { phone, password } = ctx.request.body
        let result = null
        try {
            if (phone && password) {
                let jwtLoginInfo = await userService.jwtLogin(phone, password)
                result = { code: 0, message: '登录成功', data: jwtLoginInfo } 
            }
            else {
                ctx.status = 400
                result = { code: 1, message: '缺少必要的登录信息' }
            }
        } catch (error) {
            ctx.status = 500
            result = { code: -1, message: '服务器内部错误：' + error.message }
        }
        ctx.body = result
    }

    async updatePassword(ctx, next) {
        ctx.body = `你好${ctx.state.userInfo.account}，你可以修改密码`
    }
}

module.exports = new UserController();
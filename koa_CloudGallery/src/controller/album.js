const albumService = require('../service/album.js')

class albumController {

    async createAlbum(ctx, next) {
        const { userId, albumName } = ctx.request.body
        let result = null
        try {
            if (userId && albumName) {
                const res = await albumService.createAlbum(userId, albumName)
                if (res)
                    result = { code: 0, message: '创建成功', data: res }
                else
                    result = { code: 1, message: '创建失败' }
            }
            else {
                ctx.status = 400
                result = { code: 2, message: '缺少必要的信息' }
            }
        } catch (error) {
            ctx.status = 500
            result = { code: -1, message: '服务器内部错误：' + error.message }
        }
        ctx.body = result
    }

    async deleteAlbum(ctx, next) {
        const { albumId } = ctx.request.body
        let result = null
        try {
            if (albumId) {
                const res = await albumService.deleteAlbum(albumId)
                if (res === 0)
                    result = { code: 0, message: '删除成功' }
                else
                    result = { code: 1, message: '删除失败' }
            }
            else {
                ctx.status = 400
                result = { code: 2, message: '缺少必要的信息' }
            }
        } catch (error) {
            ctx.status = 500
            result = { code: -1, message: '服务器内部错误：' + error.message }
        }
        ctx.body = result
    }

    async modifyAlbum(ctx, next) {
        const { albumId, newInfoObj } = ctx.request.body
        let result = null
        try {
            if (albumId) {
                const res = await albumService.modifyAlbum(albumId, newInfoObj)
                if (res === 0)
                    result = { code: 0, message: '修改成功' }
                else
                    result = { code: 1, message: '修改失败' }
            }
            else {
                ctx.status = 400
                result = { code: 2, message: '缺少必要的信息' }
            }
        } catch (error) {
            ctx.status = 500
            result = { code: -1, message: '服务器内部错误：' + error.message }
        }
        ctx.body = result
    }

    async findAlbum(ctx, next) {
        const { albumId } = ctx.request.body
        let result = null
        try {
            if (albumId) {
                const res = await albumService.findAlbum(albumId)
                if (res)
                    result = { code: 0, message: '查找成功', data: res }
                else
                    result = { code: 1, message: '查找失败' }
            }
            else {
                ctx.status = 400
                result = { code: 2, message: '缺少必要的信息' }
            }
        } catch (error) {
            ctx.status = 500
            result = { code: -1, message: '服务器内部错误：' + error.message }
        }
        ctx.body = result
    }

    async findAllAlbum(ctx, next) {
        let result = null
        try {
            const res = await albumService.findAllAlbum()
            if (res)
                result = { code: 0, message: '查找成功', data: res }
            else
                result = { code: 1, message: '查找失败' }
        } catch (error) {
            ctx.status = 500
            result = { code: -1, message: '服务器内部错误：' + error.message }
        }
        ctx.body = result
    }

}

module.exports = new albumController();
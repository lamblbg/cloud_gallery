const mediaService = require('../service/media.js')

class mediaController {

    async createMedia(ctx, next) {
        const { albumId, mediaName, mediaType, mediaUrl, mediaSize, mediaDuration } = ctx.request.body
        let result = null
        try {
            if (albumId && mediaType && mediaUrl) {
                const res = await mediaService.createMedia(albumId, mediaName, mediaType, mediaUrl, mediaSize, mediaDuration)
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

    async deleteMedia(ctx, next) {
        const { mediaId } = ctx.request.body
        let result = null
        try {
            if (mediaId) {
                const res = await mediaService.deleteMedia(mediaId)
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

}

module.exports = new mediaController();
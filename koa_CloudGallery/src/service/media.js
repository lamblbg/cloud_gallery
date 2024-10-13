const MediaModel = require('../model/media.js')

class mediaService {
    async createMedia(albumId, mediaName, mediaType, mediaUrl, mediaSize, mediaDuration) {
        try {
            const res = await MediaModel.create(albumId, mediaName, mediaType, mediaUrl, mediaSize, mediaDuration)
            if (res)
                return res
            else
                return 1
        } catch (error) {
            return 1
        }
    }

    async deleteMedia(mediaId) {
        try {
            const res = await MediaModel.delete(mediaId)
            if (res && res.modifiedCount > 0)
                return 0
            else
                return 1
        } catch (error) {
            return 1
        }
    }

    async findAllMediaByAlbumId(albumId, skip, limit) {
        try {
            const res = await MediaModel.findAllMediaByAlbumId(albumId, skip, limit)
            if (res.length > 0)
                return res
            else
                return -1
        } catch (error) {
            return -1
        }
    }
}
module.exports = new mediaService();

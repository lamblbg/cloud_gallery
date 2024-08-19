const AlbumModel = require('../model/album.js')

class albumService {
    async createAlbum(userId, albumName) {
        try {
            const res = await AlbumModel.create(userId, albumName)
            if (res)
                return res
            else
                return 1
        } catch (error) {
            return 1
        }
    }

    async deleteAlbum(albumId) {
        try {
            const res = await AlbumModel.delete(albumId)
            if (res && res.modifiedCount > 0)
                return 0
            else
                return 1
        } catch (error) {
            console.log()
            return 2
        }
    }

    async modifyAlbum(albumId, newInfoObj) {
        try {
            const res = await AlbumModel.modify(albumId, newInfoObj)
            if (res && res.modifiedCount > 0)
                return 0
            else
                return 1
        } catch (error) {
            return 1
        }
    }

    async findAlbum(albumId) {
        try {
            const res = await AlbumModel.find(albumId)
            if (res)
                return res
            else
                return 1
        } catch (error) {
            return 1
        }
    }

    async findAllAlbum() {
        try {
            const res = await AlbumModel.all()
            if (res)
                return res
            else
                return 1
        } catch (error) {
            return 1
        }
    }

}
module.exports = new albumService();

const albumSchema = require('../schema/album')
const mongodb = require('../db/mongodb')

class AlbumModel {
    constructor() {
        if (!mongodb.conn) {
            mongodb.init().then((conn) => {
                this.Album = conn.model('album', albumSchema)
            })
        }
        else {
            this.Album = mongodb.conn.model('album', albumSchema)
        }
    }

    async create(userId, albumName) {
        return await this.Album.create({ userId, name: albumName })
    }

    async delete(albumId) {
        return await this.Album.updateOne({ _id: albumId }, { isDeleted: true })
    }

    async modify(albumId, newInfoObj) {
        return await this.Album.updateOne({ _id: albumId }, newInfoObj)
    }

    async find(albumId) {
        return await this.Album.findOne({ _id: albumId })
    }

    async all() {
        return await this.Album.find({})
    }
}

module.exports = new AlbumModel();

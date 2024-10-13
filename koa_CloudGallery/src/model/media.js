const mediaSchema = require('../schema/media')
const albumSchema = require('../schema/album')
const mongodb = require('../db/mongodb')

class MediaModel {
    constructor() {
        if (!mongodb.conn) {
            mongodb.init().then((conn) => {
                this.conn = conn
                this.Media = conn.model('media', mediaSchema)
                this.Album = conn.model('album', albumSchema)
            })
        }
        else {
            this.conn = mongodb.conn
            this.Media = mongodb.conn.model('media', mediaSchema)
            this.Album = mongodb.conn.model('album', albumSchema)
        }
    }

    async create(albumId, mediaName, mediaType, mediaUrl, mediaSize, mediaDuration) {
        const mediaResult = await this.Media.create({
            albumId,
            name: mediaName,
            type: mediaType,
            url: mediaUrl,
            size: mediaSize,
            duration: mediaDuration
        });

        const albumResult = await this.Album.updateOne(
            { _id: albumId },
            { $set: { cover: mediaUrl }, $inc: { mediaCount: 1 } }, // 使用 $set 操作符来明确设置字段  

        );
        return { mediaResult, albumResult };

        const session = await this.conn.startSession();
        try {
            // 开始事务  
            session.startTransaction();

            // 确保在事务中执行操作  
            const mediaResult = await this.Media.create([{
                albumId,
                name: mediaName,
                type: mediaType,
                url: mediaUrl,
                size: mediaSize,
                duration: mediaDuration
            }], { session });

            const albumResult = await this.Album.updateOne(
                { _id: albumId },
                { $set: { cover: mediaUrl } }, // 使用 $set 操作符来明确设置字段  
                { session }
            );

            // 提交事务  
            await session.commitTransaction();
            session.endSession();

            console.log(mediaResult, albumResult);

            // 可以选择返回结果或进一步处理  
            return { mediaResult, albumResult };
        } catch (error) {
            // 如果出现错误，则回滚事务  
            await session.abortTransaction();
            session.endSession();
            console.log(error);
            // 抛出错误以便上层调用者可以处理  
            throw error;
        }
    }

    async delete(mediaId) {
        return await this.Media.updateOne({ _id: mediaId }, { isDeleted: true })
    }

    async findAllMediaByAlbumId(albumId, skip, limit) {
        return await this.Media.find({ albumId }).skip(skip).limit(limit)
    }
}

module.exports = new MediaModel();

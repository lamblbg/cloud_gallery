import eventBus from '@/utils/eventBus';
import http from '@/utils/http.js'

Page({
    data: {
        album: {},
        mediaList: [],
        nextDataPosition: 8,
        total: 15
    },

    onClickImage(event) {
        let { albumindex, imageindex } = event.currentTarget.dataset
        console.log(albumindex, imageindex)
        wx.previewImage({
            current: this.data.mediaList[albumindex].medias[imageindex].url, // 当前显示图片的http链接
            urls: this.data.mediaList[albumindex].medias.map(item => item.url) // 需要预览的图片http链接列表
        })
    },

    async getMedia(albumId, skip, limit) {
        let res = await http.get('/media/findAllMediaByAlbumId', {
            albumId,
            skip,
            limit
        })
        let mediaList = res.data.data
        let temp = {}
        for (let item of mediaList) {
            let key = item.createTime.match(/(.*?)T.*?/)[1]
            if (temp[key]) {
                temp[key].push(item)
            }
            else {
                temp[key] = [item]
            }
        }
        let CategorizedMediaList = []
        for (let key in temp) {
            CategorizedMediaList.push({ date: key, medias: temp[key] })
        }
        return CategorizedMediaList
    },

    async onLoad() {
        await new Promise(resolve => {
            eventBus.$on('clickAblum', (album) => {
                this.setData({ album })
                resolve()
            });
        })

        let CategorizedMediaList = await this.getMedia(this.data.album._id, 0, this.data.nextDataPosition)
        this.setData({ mediaList: CategorizedMediaList })
    },

    async onReachBottom() {
        if (this.data.nextDataPosition >= this.data.album.mediaCount) return
        let CategorizedMediaList = await this.getMedia(this.data.album._id, this.data.nextDataPosition, 5)
        this.setData({ nextDataPosition: this.data.nextDataPosition + 5 })
        // 如果新请求的数组第一项属于原数组的最后一项
        if (this.data.mediaList[this.data.mediaList.length - 1].date === CategorizedMediaList[0].date) {
            this.data.mediaList[this.data.mediaList.length - 1].medias.push(...CategorizedMediaList[0].medias)
            CategorizedMediaList.shift()
        }
        this.setData({ mediaList: this.data.mediaList.concat(CategorizedMediaList) })
    }
})
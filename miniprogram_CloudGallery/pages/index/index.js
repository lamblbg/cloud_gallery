import eventBus from '@/utils/eventBus';
import http from '@/utils/http.js'

Page({
    data: {
        show: false,
        actions: [
            {
                name: '上传照片',
                index: 0,
            },
            {
                name: '上传视频',
                index: 1,
            },
        ],
        albums: []
    },

    onClickEllipsis(e) {
        wx.navigateTo({
            url: '/pages/profile-settings/profile-settings',
        })
    },

    async onClickAlbum(e) {
        let { album } = e.currentTarget.dataset
        await wx.navigateTo({
            url: `/pages/album-detail/album-detail?album=${album._id}`
        })
        eventBus.$emit('clickAblum', album);
    },

    async requestAlbums() {
        let res = await http.get('/album/all')
        if (res.data && res.data.code === 0) {
            this.setData({ albums: res.data.data })
        }
    },

    onShow() {
        this.requestAlbums()
    },

    onChangeAdd(event) {
        this.setData({ show: !this.data.show });
    },

    async onSelectMedia(event) {
        try {
            let res = await wx.chooseMedia({
                count: 9,
                mediaType: ['image', 'video'],
                sourceType: ['album', 'camera'],
                maxDuration: 30,
                camera: 'back',
            })
            let allTemporaryFile = res.tempFiles
            await wx.navigateTo({
                url: '/pages/upload-page/upload-page'
            })
            eventBus.$emit('getChooseAlbum', this.data.albums[0]);
            eventBus.$emit('getAllTemporaryFile', allTemporaryFile);
        } catch (error) {
            console.info("用户选择终止上传文件", error.message)
        }
    },
})

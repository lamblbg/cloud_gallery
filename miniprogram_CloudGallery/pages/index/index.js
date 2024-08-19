import eventBus from '../../utils/eventBus';

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

    requestAlbums() {
        wx.request({
            url: 'http://127.0.0.1:3001/album/all',
            method: 'GET',
            success: (res) => {
                this.setData({ albums: res.data.data })
            },
            fail: (err) => {
                console.log(err)
            }
        })
    },

    onShow() {
        this.requestAlbums()
    },

    onLoad() {
        this.requestAlbums()
    },

    onClose(event) {
        this.setData({ show: false });
    },

    onAdd(event) {
        this.setData({ show: true });
    },

    onSelect(event) {
        const { index } = event.detail
        this.onChooseMedia()
    },

    // 选择文件
    onChooseMedia: function () {
        return new Promise(resolve => {
            wx.chooseMedia({
                count: 9,
                mediaType: ['image', 'video'],
                sourceType: ['album', 'camera'],
                maxDuration: 30,
                camera: 'back',
                success: (res) => resolve(res.tempFiles)
            })
        })
            .then(allTemporaryFile => {
                wx.navigateTo({
                    url: '/pages/uploadsetting/uploadsetting',
                    success: (res) => {
                        eventBus.$emit('getChooseAlbum', this.data.albums[0]);
                        eventBus.$emit('getAllTemporaryFile', allTemporaryFile);
                    },
                    fail: function (err) {
                        console.log(err)
                    }
                })
            })
    },
})

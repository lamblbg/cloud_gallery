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

    onClick(e) {
        wx.navigateTo({
            url: '/pages/photo/photo',
        }).then(() => {
            let clickAblum = e.currentTarget.dataset.album
            eventBus.$emit('clickAblum', clickAblum);
        })
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

    onLoad() {
        // this.requestAlbums()
    },

    onClose(event) {
        this.setData({ show: false });
    },

    onAdd(event) {
        this.setData({ show: true });
    },

    async onSelect(event) {
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
                url: '/pages/uploadsetting/uploadsetting'
            })
            eventBus.$emit('getChooseAlbum', this.data.albums[0]);
            eventBus.$emit('getAllTemporaryFile', allTemporaryFile);
        } catch (error) {
        }
    },
})

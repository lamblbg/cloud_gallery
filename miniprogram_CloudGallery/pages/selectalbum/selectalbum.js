import eventBus from '../../utils/eventBus';

Page({
    data: {
        albums: []
    },

    onLoad() {
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

    onSelect(event) {
        const chooseIndex = this.data.albums.findIndex(item=>item._id === event.currentTarget.dataset.albumid)
        eventBus.$emit('getChooseAlbum', this.data.albums[chooseIndex]);
        wx.navigateBack({})
    }
})
import uploadHandler from '../../utils/file-upload.js'
import eventBus from '../../utils/eventBus.js'
Page({
    data: {
        fileList: [],
        fileListRaw: [],
        isSelectAlbum: true,
        currentAlbumId: '',
        currentAlbum: '',
        albumName: ''
    },

    // 确认上传
    onUpload(event) {

        if (!this.data.isSelectAlbum) {
            // 创建新相册
            new Promise((resolve, reject) => {
                wx.request({
                    url: 'http://127.0.0.1:3001/album/create',
                    method: 'POST',
                    data: {
                        userId: 'lamb',
                        albumName: this.data.albumName
                    },
                    success: (res) => {
                        resolve(res.data)
                    },
                    fail: (err) => {
                        reject(err)
                    }
                })
            })
                // 拿到新相册id
                .then((res) => {
                    const currentAlbumId = res.data._id
                    this.setData({ currentAlbumId })
                    return currentAlbumId
                })
                // 上传文件到服务器
                .then(currentAlbumId => {
                    // console.log(currentAlbumId)
                    return uploadHandler(this.data.fileListRaw, 'lamb').then(res => {
                        return res
                    }).catch(err => {
                        console.log(err)
                    })
                })
                // 把文件信息和相册信息关联并存到数据库
                .then(allFileUrlInfo => {
                    let task = []

                    for (let item of allFileUrlInfo) {
                        task.push(new Promise((resolve, reject) => {
                            wx.request({
                                url: 'http://127.0.0.1:3001/media/create',
                                method: 'POSt',
                                data: {
                                    albumId: this.data.currentAlbumId,
                                    mediaType: item.data.match(/(\.[^.]+)$/)[1],
                                    mediaUrl: item.data
                                },
                                success: (res) => {
                                    resolve(res.data)
                                },
                                fail: (err) => {
                                    reject(err)
                                }
                            })
                        }))
                    }

                    return Promise.all(task)
                })
                // 全部上传任务完成后的后续处理
                .then(res => {
                    wx.navigateBack()
                })
                .catch(err => {
                    console.log(err)
                })
        }
        else {
            Promise.resolve()
                // 上传文件到服务器
                .then(currentAlbumId => {
                    return uploadHandler(this.data.fileListRaw, 'lamb').then(res => {
                        return res
                    }).catch(err => {
                        console.log(err)
                    })
                })
                // 把文件信息和相册信息关联并存到数据库
                .then(allFileUrlInfo => {
                    let task = []

                    for (let item of allFileUrlInfo) {
                        task.push(new Promise((resolve, reject) => {
                            wx.request({
                                url: 'http://127.0.0.1:3001/media/create',
                                method: 'POST',
                                data: {
                                    albumId: this.data.currentAlbumId,
                                    mediaType: item.data.match(/(\.[^.]+)$/)[1],
                                    mediaUrl: item.data
                                },
                                success: (res) => {
                                    resolve(res.data)
                                },
                                fail: (err) => {
                                    reject(err)
                                }
                            })
                        }))
                    }

                    return Promise.all(task)
                })
                // 全部上传任务完成后的后续处理
                .then(res => {
                    wx.navigateBack()
                })
                .catch(err => {
                    console.log(err)
                })
        }
    },

    // 输入新建相册的名字时
    handleInput(event) {
        this.setData({ albumName: event.detail.value })
    },

    // 选择相册
    onWantSelect() {
        wx.navigateTo({
            url: '/pages/selectalbum/selectalbum',
        })
    },

    // 添加文件后
    afterRead(event) {
        const { file } = event.detail;
        this.setData({ fileList: [...this.data.fileList, ...file.map(item => ({ url: item.url }))] })
        this.setData({ fileListRaw: [...this.data.fileListRaw, ...file] })
    },

    // 切换新建相册和选择相册
    onCreateOrSelect(event) {
        this.setData({ isSelectAlbum: !this.data.isSelectAlbum })
    },

    // 删除待上传的文件
    onDelete(event) {
        let fileList = this.data.fileList
        fileList.splice(event.detail.index, 1)
        this.setData({ fileList })
    },

    // 页面加载完成后
    onLoad(options) {
        eventBus.$on('getChooseAlbum', this.handleGetChooseAlbum);
        eventBus.$on('getAllTemporaryFile', this.handleGetAllTemporaryFile);
    },

    // 页面卸载时
    onUnload(options) {
        eventBus.$off('getChooseAlbum', this.handleGetChooseAlbum);
        eventBus.$off('getAllTemporaryFile', this.handleGetAllTemporaryFile);
    },

    handleGetChooseAlbum: function (data) {
        if (data) {
            this.setData({ currentAlbum: data })
            this.setData({ currentAlbumId: data._id })
        }
    },

    handleGetAllTemporaryFile: function (data) {
        let temp = data.map(item => ({ size: item.size, type: item.fileType, url: item.tempFilePath }))
        this.setData({ fileListRaw: temp })
        this.setData({ fileList: data.map(item => ({ url: item.tempFilePath })) })
    }
})
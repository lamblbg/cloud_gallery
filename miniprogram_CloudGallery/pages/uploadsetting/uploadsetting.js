import { uploadHandler, merge } from '@/utils/file-upload.js'
import eventBus from '@/utils/eventBus.js'
import http from '@/utils/http.js'

Page({
    data: {
        fileList: [],
        fileListRaw: [],
        isSelectAlbum: true,
        currentAlbumId: '',
        currentAlbum: '',
        albumName: '',
        show: false,
        progress: 0
    },

    // 确认上传按钮
    async onUpload(event) {
        // 如果是选择创建新相册
        if (!this.data.isSelectAlbum) {
            // 创建新相册
            let { data: result } = await http.request({
                url: '/album/create',
                method: 'POST',
                data: {
                    userId: 'lamb',
                    albumName: this.data.albumName
                }
            })
            // 拿到新相册id
            const currentAlbumId = result.data._id
            this.setData({ currentAlbumId })
        }
        // 显示上传进度的遮罩层
        this.setData({ show: true })
        // 上传文件到服务器
        let uploadTasks = await uploadHandler(this.data.fileListRaw, 'lamb', (progress) => {
            this.setData({ progress: progress })
            console.log(`任务进度: ${progress}%`)
            // 全部上传任务完成后的后续处理
            if (progress === 100) {
                this.setData({ show: false })
                wx.navigateBack()
            }
        })
        await Promise.all(uploadTasks.map(uploadTask => uploadTask.uploadPromise))
        // 过滤出小文件上传promise
        let smallFileUploadPromiseArr = uploadTasks.filter(uploadTask => uploadTask.type === 'small file').map(uploadTask => uploadTask.uploadPromise)
        // 获取小文件上传成功的结果
        let smallFileUploadResultArr = (await Promise.all(smallFileUploadPromiseArr)).map(item => JSON.parse(item.data))
        // 过滤出所有大文件分片的任务
        const bigFileChunksUploadArr = uploadTasks.filter(uploadTask => uploadTask.type === 'big file')
        // 根据fileHash去重
        const uniqueArray = bigFileChunksUploadArr.reduce((acc, obj) => {
            if (!acc.some(item => item.fileHash === obj.fileHash)) {
                acc.push(obj);
            }
            return acc;
        }, []);
        // 合并
        let mergeTaskArr = new Array(uniqueArray.length).fill(0).map((_, index) => merge(uniqueArray[index].fileHash, uniqueArray[index].fileExt, 'lamb'))
        let bigFileUploadResultArr = await Promise.all(mergeTaskArr)
        let allFileUrlInfo = bigFileUploadResultArr.concat(smallFileUploadResultArr)
        // 把文件信息和相册信息关联并存到数据库
        let tasks = new Array(allFileUrlInfo.length).fill(0).map((_, index) => http.request({
            url: '/media/create',
            method: 'POST',
            data: {
                albumId: this.data.currentAlbumId,
                mediaType: allFileUrlInfo[index].data.match(/(\.[^.]+)$/)[1],
                mediaUrl: allFileUrlInfo[index].data
            }
        }).then(res => res.data))
        await Promise.all(tasks)
        // 全部上传任务完成后的后续处理
        // wx.navigateBack()
    },

    // 输入新建相册的名字时
    handleInput(event) {
        this.setData({ albumName: event.detail.value })
    },

    // 选择相册
    onWantSelect() {
        wx.navigateTo({ url: '/pages/selectalbum/selectalbum' })
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
        let { fileList, fileListRaw } = this.data
        fileList.splice(event.detail.index, 1)
        fileListRaw.splice(event.detail.index, 1)
        this.setData({ fileList, fileListRaw })
    },

    onClickHide() {
        this.setData({ show: false });
    },

    noop() { },

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
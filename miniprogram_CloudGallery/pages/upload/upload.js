import uploadHandler from '../../utils/file-upload.js'
Page({
    data: {
        willUploadRawFileInfo: []
    },

    checkwillUploadFile() {
        console.log(this.data.willUploadRawFileInfo)
    },

    uploadFile() {
        uploadHandler(this.data.willUploadRawFileInfo, 'lamb1').then(res => {
            console.log(res)
        }).catch(err => {
            console.log(err)
        })
    },

    afterRead: function (event) {
        this.setData({ willUploadRawFileInfo: [...this.data.willUploadRawFileInfo, ...event.detail.file] })
    },

});


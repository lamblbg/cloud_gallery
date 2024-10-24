import { getWatermarkImage, save2local } from '@/utils/watermark.js'

Page({
    data: {
        orginImg: '',
        watermarkImg: '',
        watermarkText: '仅供xxx办理使用',
        watermarkFontSize: 40
    },

    onBack(e) {
        wx.navigateBack()
    },

    onSave() {
        save2local(this.data.watermarkImg)
    },

    async getWatermarkImgTempFilePath(watermarkText, fontSize = 20) {
        return await getWatermarkImage(this.data.orginImg, watermarkText, fontSize)
    },

    async onSliderChange(e) {
        let watermarkFontSize = e.detail.value
        let tempFilePath = await this.getWatermarkImgTempFilePath(this.data.watermarkText, watermarkFontSize)
        this.setData({ watermarkImg: tempFilePath, watermarkFontSize })
    },

    async onChange(e) {
        let watermarkText = e.detail.value
        let tempFilePath = await this.getWatermarkImgTempFilePath(watermarkText, this.data.watermarkFontSize)
        this.setData({ watermarkImg: tempFilePath, watermarkText: watermarkText })
    },

    async onLoad(options) {
        this.setData({ orginImg: options.img })
        let tempFilePath = await this.getWatermarkImgTempFilePath(this.data.watermarkText, this.data.watermarkFontSize)
        this.setData({ watermarkImg: tempFilePath })
    },
})
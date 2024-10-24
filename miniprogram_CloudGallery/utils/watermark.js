// 小程序Canvas API实现图片水印的函数
// 获取水印图片临时地址
export async function getWatermarkImage(sourceImageUrl, watermarkText, fontSize = 60, color = 'rgba(255, 255, 255, 0.8)', angle = Math.PI / 4) {
    // 获取水印图片临时路径
    let tempFilePath = await new Promise((resolve, reject) => {
        wx.createSelectorQuery()
            .select('#myCanvas')
            .node(({ node: canvas }) => {
                const context = canvas.getContext('2d')

                const image = canvas.createImage()
                image.onload = (res) => {
                    let { width, height } = res.path[0]
                    // 调整画布大小
                    canvas.width = width * 2
                    canvas.height = height * 2
                    // 画图像
                    context.drawImage(image, width, height,)

                    // 画水印
                    context.font = `${fontSize}px sans-serif`; // 水印字体大小
                    context.fillStyle = color; // 水印颜色
                    context.translate(0, height * 2)
                    context.rotate(2 * Math.PI - angle)
                    for (let i = 0, n = 2 * width; i < n; i += n / 10) {
                        for (let j = 0, k = 2 * height; j < k; j += k / 10)
                            context.fillText(watermarkText, i, j,); // 水印位置 
                    }

                    // 获取加了水印的图片的临时路径
                    wx.canvasToTempFilePath({
                        x: width / 2,
                        y: height / 2,
                        canvas,
                        fileType: 'jpg',
                        // quality: 0.9,
                        success(res) {
                            resolve(res.tempFilePath)
                        },
                        fail(err) {
                            reject(err)
                        }
                    })
                }
                image.src = sourceImageUrl
            })
            .exec(() => {
            })
    })

    return tempFilePath
}

// 保存到本地
export async function save2local(tempFilePath) {
    // 保存图片到相册
    try {
        await wx.saveImageToPhotosAlbum({
            filePath: tempFilePath
        })
        console.log('保存成功')
    }
    // 拒绝授权后的处理
    catch (err) {
        if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
            wx.openSetting({
                success(settingdata) {
                    if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        console.log('获取权限成功，再次点击图片保存到相册')
                    } else {
                        console.log('获取权限失败')
                    }
                }
            })
        }
    }
}

function getWatermarkOrigin(imageHeight, angle) {
    let x = imageHeight * Math.sin(Math.PI / 2 - angle)
    let y = x * Math.sin(angle)
    let z = x * Math.sin(Math.PI - Math.PI / 2 - angle)
    return [y, z]

    // 调用
    // let [x, y] = getWatermarkOrigin(height, Math.PI / 6)
}
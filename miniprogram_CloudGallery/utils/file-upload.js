// 传入一个待上传的文件数据，每个元素要有url、size属性
const SparkMD5 = require('./spark-md5.js');

export default function (allTemporaryFile, userName, chunkSize = 1024 * 1024 * 1) {// 1MB
    return new Promise((resolve, reject) => {
        uploadFile(allTemporaryFile, userName, chunkSize).then(res => resolve(res)).catch(err => reject(err))
    })
}

const uploadFile = (allTemporaryFile, userName, chunkSize) => {
    let task = []
    for (let temporaryFile of allTemporaryFile) {
        // 小文件直接单文件上传
        if (temporaryFile.size <= chunkSize) {
            console.log('小文件')
            task.push(new Promise((resolve, reject) => {
                upload(false, temporaryFile.url, userName).then(res => resolve(res)).catch(err => reject(err))
            }))
        }
        // 大文件分片上传
        else {
            console.log('大文件')
            let fileHash = ''
            let ext = ''
            // 读大文件
            let p = new Promise((resolve, reject) => {
                ext = temporaryFile.url.match(/(\.[^.]+)$/)[1]
                wx.getFileSystemManager().readFile({
                    filePath: temporaryFile.url,
                    encoding: 'binary', // 读取为ArrayBuffer  
                    success: res => resolve(res),
                    fail: err => reject(err)
                })
            })
                // 分片
                .then(res => {
                    return new Promise(async (resolve, reject) => {
                        let fileContent = res.data;
                        let fileSize = fileContent.length;
                        let offset = 0;
                        let chunkCount = Math.ceil(fileSize / chunkSize);
                        fileHash = SparkMD5.hashBinary(fileContent);
                        let chunksData = [];

                        function _writeArrayBufferToTempFile(arrayBuffer, fileHash, chunkHash) {
                            return new Promise((resolve, reject) => {
                                const fs = wx.getFileSystemManager();
                                fs.mkdir({ dirPath: `${wx.env.USER_DATA_PATH}/${fileHash}` })
                                const chunkPath = `${wx.env.USER_DATA_PATH}/${fileHash}/${chunkHash}`;
                                fs.writeFile({
                                    filePath: chunkPath,
                                    data: arrayBuffer,
                                    encoding: 'binary',
                                    success: res => {
                                        let chunkData = {
                                            fileHash: fileHash,
                                            chunkHash: chunkHash,
                                            chunk: chunkPath
                                        }
                                        resolve(chunkData)
                                    },
                                    fail: err => {
                                        reject(err)
                                    }
                                })
                            })
                        }

                        function _handleChunk(index) {
                            return new Promise((resolve, reject) => {
                                if (index >= chunkCount) return;

                                let chunk = fileContent.slice(offset, offset + chunkSize);
                                offset += chunkSize;
                                if (offset > fileSize) {
                                    // 处理最后一个分片可能不足chunkSize的情况  
                                    chunk = fileContent.slice(offset - chunkSize, fileSize);
                                }
                                // 将分片保存到本地临时目录 
                                _writeArrayBufferToTempFile(chunk, fileHash, index).then(res => resolve(res)).catch(err => reject(err))
                            })
                        };

                        for (let i = 0; i < chunkCount; i++) {
                            const res = await _handleChunk(i)
                            chunksData.push(res)
                        }
                        resolve(chunksData)
                    })
                })
                // 上传
                .then(chunksData => {
                    return new Promise((resolve, reject) => {
                        try {
                            for (let chunkData of chunksData) {
                                upload(true, chunkData, userName)
                            }
                            resolve('所有分片都已上传成功')
                        } catch (error) {
                            reject('分片上传失败')
                        }
                    })
                })
                // 合并
                .then(res => {
                    return merge(fileHash, ext, userName) // user是用来确定合并的目录
                })
            task.push(p)
        }
    }
    return Promise.all(task)
}

// 文件上传  
const upload = (isBigFile, filePathOrChunkData, userName) => {
    return new Promise((resolve, reject) => {
        if (!isBigFile) {
            _upload('http://localhost:3001/upload/single', filePathOrChunkData, 'album', {
                user: userName
            }).then(res => resolve(res)).catch(err => reject(err))
        }
        else {
            _upload('http://localhost:3001/upload/largefile', filePathOrChunkData.chunk, 'chunk', {
                fileHash: filePathOrChunkData.fileHash,
                chunkHash: filePathOrChunkData.chunkHash,
                user: userName
            }).then(res => resolve(res)).catch(err => reject(err))
        }
    })

    function _upload(url, filePath, name, formData) {
        return new Promise((resolve, reject) => {
            wx.uploadFile({
                url,
                filePath,
                name, // 后端接收文件的参数名，默认为file   
                formData,
                header: {
                    "Content-Type": "multipart/form-data"
                },
                success(res) {
                    resolve(JSON.parse(res.data))
                },
                fail(err) {
                    reject(err)
                }
            });
        })
    }
}

// 文件合并
function merge(fileHash, ext, userName) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'http://127.0.0.1:3001/upload/merge',
            method: 'POST',
            data: {
                fileHash,
                ext,
                user: userName
            },
            success: (res) => {
                resolve(res.data)
            },
            fail: (err) => {
                reject(err)
            }
        })
    })
}
const SparkMD5 = require('./spark-md5.js');
import http from './http.js';


// 传入一个待上传的allTempFiles文件数组，每个元素要有url、size、type属性  
export async function uploadHandler(allTempFiles, userName, progressCallback, chunkSize = 1024 * 1024 * 1) { // 1MB  
    let newAllTempFiles = [], uploadedProgressArr = [], totalFileSize = 0
    // 压缩媒体
    let compressedFiles = await compress(allTempFiles)
    // 计算媒体压缩后的总大小
    totalFileSize = compressedFiles.reduce((prev, cur) => prev += cur.size, 0)

    function handleUploadProgress(progressCallback, index) {
        return (res) => {
            if (progressCallback && typeof progressCallback === 'function') {
                uploadedProgressArr[index] = res.totalBytesSent
                let curProgress = Math.floor(uploadedProgressArr.reduce((prev, cur) => prev += cur, 0) / totalFileSize * 100)
                progressCallback(curProgress)
            }
        }
    }

    // 处理出一个新的待上传文件列表
    for (let tempFile of compressedFiles) {
        // 读文件，获取md5
        let fileArrayBuffer = await readFile(tempFile.url);
        let fileMD5 = SparkMD5.hashBinary(fileArrayBuffer.data);

        // 小文件直接加入
        if (tempFile.size <= chunkSize) {
            tempFile.fileHash = fileMD5
            newAllTempFiles.push(tempFile)
        }
        // 大文件分割成切片后加入
        else {
            let fileExtension = tempFile.url.match(/(\.[^.]+)$/)[1];
            // 分片  
            let fileChunks = await _sharding(fileArrayBuffer.data, chunkSize, fileMD5, fileExtension)
            newAllTempFiles.push(...fileChunks)
        }
    }

    // 到此newAllTempFiles的数据结构如下
    // 小文件：{ type, url, size, fileMD5 }
    // 大文件的分片：{ fileHash, chunkHash, chunkPath, fileExtension }

    // 处理出一个上传任务列表
    let uploadTasks = newAllTempFiles.map((item, index) => {
        let task = _upload(item, userName, handleUploadProgress(progressCallback, index));

        if (item.hasOwnProperty('size')) {
            console.log('小文件');
            task.isChunk = false
        }
        else {
            console.log('大文件的分片');
            task.isChunk = true
            task.fileHash = item.fileHash
            task.fileExt = item.fileExtension
        }
        return task
    })
    return uploadTasks;
}

// 压缩
async function compress(fileList) {
    for (let item of fileList) {
        // 更新上传的文件为压缩后的文件
        let res = await wx.compressImage({
            src: item.url,
            quality: 12
        })
        item.url = res.tempFilePath

        // 更新文件大小为压缩后的文件的大小
        let fileInfo = await new Promise(resolve => {
            wx.getFileSystemManager().getFileInfo({
                filePath: item.url,
                success: resolve
            })
        })
        item.size = fileInfo.size
    }
    return fileList
}

// 读文件
export async function readFile(filePath) {
    return new Promise((resolve, reject) => {
        wx.getFileSystemManager().readFile({
            filePath: filePath,
            encoding: 'binary', // 读取为ArrayBuffer    
            success: resolve,
            fail: reject
        });
    });
}

// 分片
async function _sharding(fileArrayBuffer, chunkSize, fileMD5, fileExtension) {
    let fileLength = fileArrayBuffer.length;
    let startOffset = 0;
    let chunkQuantity = Math.ceil(fileLength / chunkSize);

    async function writeChunkToTempFile(arrayBuffer, fileMD5Hash, chunkIndex) {
        return new Promise((resolve, reject) => {
            const fs = wx.getFileSystemManager();
            fs.mkdir({ dirPath: `${wx.env.USER_DATA_PATH}/${fileMD5Hash}` });
            const chunkPath = `${wx.env.USER_DATA_PATH}/${fileMD5Hash}/${chunkIndex}`;
            fs.writeFile({
                filePath: chunkPath,
                data: arrayBuffer,
                encoding: 'binary',
                success: res => {
                    let chunkInfo = {
                        fileHash: fileMD5Hash,
                        chunkHash: chunkIndex,
                        chunkPath: chunkPath,
                        fileExtension: fileExtension
                    };
                    resolve(chunkInfo);
                },
                fail: reject
            });
        });
    }

    async function handleChunk(index) {
        if (index >= chunkQuantity) return;

        let chunk = fileArrayBuffer.slice(startOffset, startOffset + chunkSize);
        startOffset += chunkSize;
        if (startOffset > fileLength) {
            // 处理最后一个分片可能不足chunkSize的情况    
            chunk = fileArrayBuffer.slice(startOffset - chunkSize, fileLength);
        }
        // 将分片保存到本地临时目录   
        return await writeChunkToTempFile(chunk, fileMD5, index);
    }

    let shardingTask = new Array(chunkQuantity).fill(0).map((_, index) => handleChunk(index))
    return await Promise.all(shardingTask);
}

// 上传文件   
function _upload(filePathOrChunkInfo, userName, onProgressUpdate) {
    if (!filePathOrChunkInfo.hasOwnProperty('chunkHash')) {
        return http.upload('/upload/single', filePathOrChunkInfo.url, 'album', {
            user: userName,
            fileHash: filePathOrChunkInfo.fileHash
        }, null, onProgressUpdate);
    }
    else {
        return http.upload('/upload/largefile', filePathOrChunkInfo.chunkPath, 'chunk', {
            fileHash: filePathOrChunkInfo.fileHash,
            chunkHash: filePathOrChunkInfo.chunkHash,
            user: userName
        }, null, onProgressUpdate);
    }
}

// 大文件合并  
export async function merge(fileHash, fileExt, userName) {
    let mergeResult = await http.request({
        url: '/upload/merge',
        method: 'POST',
        data: {
            fileHash,
            ext: fileExt,
            user: userName
        }
    });
    return mergeResult.data;
}